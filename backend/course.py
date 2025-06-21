import os
import json
import requests
from typing import List, Optional, TypedDict
from pydantic import BaseModel
from langgraph.graph import StateGraph, END
from langchain_core.runnables import RunnableLambda
from google import genai

# --- ENV ---
client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
KNEWBIT_API_URL = os.getenv("KNEWBIT_API_URL")

# --- API Endpoints ---
ENROLLED_COURSES_API = f"{KNEWBIT_API_URL}/enrolled_courses"
ALL_COURSES_API = f"{KNEWBIT_API_URL}/all_courses"


# --- Types ---
class CleanedCourse(TypedDict):
    id: str
    title: str
    description: Optional[str]
    category: Optional[str]
    difficulty: str
    tags: List[str]
    is_free: bool
    price: float
    rating: float
    enrollments: int


class AgentState(TypedDict):
    user_id: str
    user_question: str
    enrolled_courses: Optional[List[CleanedCourse]]
    all_courses: Optional[List[CleanedCourse]]
    matched_courses: Optional[List[dict]]


class QueryRequest(BaseModel):
    user_id: str
    user_question: str


# --- Clean course data ---
def clean_course_data(courses: List[dict]) -> List[CleanedCourse]:
    return [
        {
            "id": c["id"],
            "title": c["title"],
            "description": c.get("description") or c.get("summary") or "",
            "category": c.get("category_name", ""),
            "difficulty": c["difficulty_level"],
            "tags": c.get("tags", []),
            "is_free": c["is_free"],
            "price": c["price"],
            "rating": c["average_rating"],
            "enrollments": c["enrollment_count"],
        }
        for c in courses
        if c["status"] == "published"
    ]


# --- Step 1: Get enrolled courses ---
def fetch_enrolled(state: AgentState) -> AgentState:
    response = requests.get(f"{ENROLLED_COURSES_API}?user_id={state['user_id']}")
    enrolled = clean_course_data(response.json())
    return {**state, "enrolled_courses": enrolled}


# --- Step 2: Get all platform courses ---
def fetch_all_courses(state: AgentState) -> AgentState:
    response = requests.get(ALL_COURSES_API)
    all_courses = clean_course_data(response.json())
    return {**state, "all_courses": all_courses}


# --- Step 3: Gemini selects best matches ---
def gemini_match_courses(state: AgentState) -> AgentState:
    user_question = state["user_question"]
    enrolled_courses = state["enrolled_courses"]
    all_courses = state["all_courses"]
    enrolled_ids = {course["id"] for course in enrolled_courses}
    available_courses = [c for c in all_courses if c["id"] not in enrolled_ids]

    # Limit courses for token efficiency
    available_courses = available_courses[:100]

    prompt = f"""
You are an intelligent course recommendation system.

Analyze the user's learning query and their enrolled course history to determine their skill level, learning pattern, and interests.
Then, select the most relevant existing platform courses that would help the user achieve their goal.

User Question:
{user_question}

User's Enrolled Courses (JSON):
{json.dumps(enrolled_courses)}

Available Platform Courses (JSON):
{json.dumps(all_courses)}

Instructions:
1. Understand the user's domain knowledge and learning style from enrolled courses.
2. Identify the top 3–5 platform courses that are not already enrolled, which best align with the user's question.
3. Return a JSON list like:
[
  {{
    "id": "...",
    "title": "...",
    "reason": "why this course is ideal for the user"
  }}
]
"""

    result = client.models.generate_content(model="gemini-2.5-flash", contents=prompt)

    try:
        content = result.text.strip()
        matched = json.loads(content)
    except Exception as e:
        print("Gemini output parsing failed:", e)
        matched = []

    return {**state, "matched_courses": matched}


# --- LangGraph Workflow ---
graph = StateGraph(AgentState)

graph.add_node("fetch_enrolled", RunnableLambda(fetch_enrolled))
graph.add_node("fetch_all_courses", RunnableLambda(fetch_all_courses))
graph.add_node("gemini_match", RunnableLambda(gemini_match_courses))

graph.set_entry_point("fetch_enrolled")
graph.add_edge("fetch_enrolled", "fetch_all_courses")
graph.add_edge("fetch_all_courses", "gemini_match")
graph.add_edge("gemini_match", END)

compiled = graph.compile()
