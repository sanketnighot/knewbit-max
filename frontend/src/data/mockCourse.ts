import { CourseContent } from "@/types/course";

export const createMockCourseData = (): CourseContent => ({
  title: "Complete DevOps Mastery Course",
  video_url: "https://www.youtube.com/watch?v=Wvf0mBNGjXY",
  summary:
    "This comprehensive course covers the essential DevOps concepts including containerization with Docker, orchestration with Kubernetes, and continuous integration/continuous deployment (CI/CD) pipelines. You'll learn how to set up automated workflows, manage infrastructure as code, and implement best practices for modern software development and deployment. The course is designed for developers and system administrators who want to master the DevOps workflow and improve their deployment processes.",
  flashcards: [
    {
      question: "What is Docker and why is it important in DevOps?",
      answer:
        "Docker is a containerization platform that packages applications and their dependencies into lightweight, portable containers. It's important in DevOps because it ensures consistency across different environments, simplifies deployment, and enables microservices architecture.",
    },
    {
      question: "What is the difference between Docker and Kubernetes?",
      answer:
        "Docker is a containerization platform for creating and running containers, while Kubernetes is an orchestration platform for managing multiple containers at scale. Kubernetes handles deployment, scaling, networking, and service discovery for containerized applications.",
    },
    {
      question: "What is CI/CD in DevOps?",
      answer:
        "CI/CD stands for Continuous Integration and Continuous Deployment. CI involves automatically testing and integrating code changes, while CD automates the deployment process. This enables faster, more reliable software releases.",
    },
    {
      question: "What is Infrastructure as Code (IaC)?",
      answer:
        "Infrastructure as Code is the practice of managing and provisioning computing infrastructure through machine-readable definition files, rather than manual processes. Tools like Terraform and AWS CloudFormation enable IaC.",
    },
    {
      question: "What are the benefits of using microservices architecture?",
      answer:
        "Microservices offer better scalability, technology diversity, independent deployment, fault isolation, and easier maintenance. Each service can be developed, deployed, and scaled independently.",
    },
  ],
  quiz: [
    {
      question:
        "Which command is used to build a Docker image from a Dockerfile?",
      type: "multiple_choice",
      options: [
        "docker create",
        "docker build",
        "docker run",
        "docker compile",
      ],
      correct_answer: "docker build",
    },
    {
      question: "What is the main purpose of a Kubernetes pod?",
      type: "multiple_choice",
      options: [
        "To store container images",
        "To manage network traffic",
        "To group one or more containers that share storage and network",
        "To monitor application performance",
      ],
      correct_answer:
        "To group one or more containers that share storage and network",
    },
    {
      question:
        "CI/CD stands for Continuous Integration and Continuous Deployment.",
      type: "true_false",
      correct_answer: true,
    },
    {
      question: "Docker containers share the host operating system kernel.",
      type: "true_false",
      correct_answer: true,
    },
    {
      question: "What is the primary benefit of using Infrastructure as Code?",
      type: "multiple_choice",
      options: [
        "Faster internet speeds",
        "Reduced hardware costs",
        "Reproducible and version-controlled infrastructure",
        "Better user interfaces",
      ],
      correct_answer: "Reproducible and version-controlled infrastructure",
    },
  ],
});
