# 🧪 Frontend Testing Guide

Quick guide to test your Knewbit Max frontend application.

## 🚀 Quick Verification

### 1. Basic Setup Test

```bash
# Install dependencies
bun install

# Start development server
bun dev

# Check if running
curl http://localhost:3000
```

### 2. Environment Variables Check

Create `.env.local` with:

```bash
# Required variables
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:3001

# Optional but recommended
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

### 3. Feature Testing Checklist

#### ✅ Basic Functionality
- [ ] Homepage loads without errors
- [ ] Navigation works correctly
- [ ] Dark theme is applied
- [ ] Responsive design works on mobile

#### ✅ AI Tutor Feature
- [ ] Chat interface appears in course pages
- [ ] Can type messages in chat input
- [ ] Loading indicators appear when sending messages
- [ ] Error handling works when backend is down

#### ✅ Video Dubbing
- [ ] Language selector appears
- [ ] Can select different languages
- [ ] Progress indicators work during dubbing
- [ ] Error messages appear for failed requests

#### ✅ Course Features
- [ ] Course recommendations load
- [ ] Course pages display properly
- [ ] Flashcards and quizzes work
- [ ] Tab navigation functions correctly

## 🐛 Common Issues & Solutions

### Issue: Build Errors
```bash
# Clear cache and reinstall
rm -rf .next node_modules
bun install
bun dev
```

### Issue: API Connection Errors
```bash
# Check backend is running
curl http://localhost:8000/health

# Verify environment variables
echo $NEXT_PUBLIC_BACKEND_URL
```

### Issue: TypeScript Errors
```bash
# Check types
bun run type-check

# Fix formatting
bun run lint --fix
```

## 🧪 Manual Testing Script

Save this as `test-frontend.js` and run with `node test-frontend.js`:

```javascript
const https = require('http');

function testEndpoint(url, description) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        console.log(`✅ ${description}: OK`);
        resolve(true);
      } else {
        console.log(`❌ ${description}: Failed (${res.statusCode})`);
        resolve(false);
      }
    }).on('error', (err) => {
      console.log(`❌ ${description}: Error - ${err.message}`);
      resolve(false);
    });
  });
}

async function runTests() {
  console.log('🚀 Testing Knewbit Max Frontend\n');

  const tests = [
    testEndpoint('http://localhost:3000', 'Homepage'),
    testEndpoint('http://localhost:3000/_next/static/css', 'CSS Assets'),
  ];

  const results = await Promise.all(tests);
  const passed = results.filter(Boolean).length;

  console.log(`\n📊 Results: ${passed}/${results.length} tests passed`);

  if (passed === results.length) {
    console.log('🎉 Frontend is working correctly!');
  } else {
    console.log('⚠️  Some issues detected. Check output above.');
  }
}

runTests();
```

## 🔍 Browser Developer Tools Testing

1. **Open Developer Tools** (F12)
2. **Check Console** for errors
3. **Network Tab** to verify API calls
4. **Application Tab** to check localStorage/cookies

### Expected Network Calls:
- `GET /` - Homepage
- `POST /ai-tutor` - AI chat (if testing chat)
- `POST /recommend-courses` - Course recommendations
- `POST /dub` - Video dubbing (if testing dubbing)

## 📱 Mobile Testing

Test responsive design:

```bash
# Use Chrome DevTools device simulation
# Or access from mobile device:
# http://YOUR_LOCAL_IP:3000
```

### Mobile Checklist:
- [ ] Navigation menu works on small screens
- [ ] Chat interface is usable on mobile
- [ ] Video player is responsive
- [ ] Touch interactions work properly

## ⚡ Performance Testing

### Lighthouse Testing:
1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Run performance audit
4. Aim for scores > 90

### Expected Metrics:
- **Performance**: > 90
- **Accessibility**: > 95
- **Best Practices**: > 90
- **SEO**: > 85

## 🔒 Security Testing

### Check for Common Issues:
- [ ] No sensitive data in console logs
- [ ] API keys not exposed in client code
- [ ] HTTPS enforced in production
- [ ] XSS protection enabled

## 📊 Bundle Analysis

```bash
# Analyze bundle size
bun run build
bun run analyze

# Or use webpack-bundle-analyzer
npx webpack-bundle-analyzer .next/static/chunks/*.js
```

---

**💡 Tip**: Run these tests after any major changes to ensure everything still works correctly!
