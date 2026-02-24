# Testing and Verification Guide

## 🧪 Testing the Document Intelligence API Platform

### 1. Start the Development Servers

1. **Backend Server:**
```bash
cd backend
npm run dev
```
- Server should start on `http://localhost:5000`
- You should see: `Server running on port 5000`

2. **Frontend Server:**
```bash
cd ../frontend
npm run dev
```
- Server should start on `http://localhost:5173`
- You should see: `VITE v7.3.0 ready in XXX ms`

### 2. Test API Endpoints

You can test the backend API using curl or Postman:

```bash
# Test status endpoint
curl http://localhost:5000/api/status
```
Expected response:
```json
{
  "status": "OK",
  "message": "Document Intelligence API is running"
}
```

### 3. Test Frontend Functionality

1. **Open the application:**
   - Navigate to `http://localhost:5173` in your browser

2. **Test Authentication:**
   - Click "Sign up" and create a new account
   - Log in with your credentials
   - Verify you're redirected to the dashboard

3. **Test Theme Toggle:**
   - Click the theme toggle button in the sidebar
   - Verify the theme changes between dark and light modes
   - Check that the preference persists on page refresh

4. **Test Navigation:**
   - Click through all sidebar navigation items
   - Verify each page loads correctly:
     - Dashboard
     - Documents
     - Usage
     - Profile

5. **Test Document Upload (Mock):**
   - On the Dashboard page, use the file upload interface
   - Select a PDF or image file
   - Click "Upload" and observe the progress bar
   - Note: This is a mock implementation - no actual upload occurs

6. **Test API Key Generation (Mock):**
   - Navigate to a document detail page (click on any document)
   - Click "Generate API Key"
   - Verify the modal appears with a generated key
   - Test the "Copy to Clipboard" functionality

7. **Test Usage Analytics:**
   - Navigate to the Usage page
   - Verify all charts are displayed correctly
   - Test the time range filters (7D, 30D, 90D)

8. **Test Profile Functionality:**
   - Navigate to the Profile page
   - Verify your user information is displayed
   - Test the logout functionality

### 4. Browser Compatibility

Test the application in:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### 5. Responsive Design Testing

1. **Desktop:** Verify layout on screens ≥ 1024px
2. **Tablet:** Test on screens between 768px - 1023px
3. **Mobile:** Test on screens < 768px
   - Verify sidebar collapses properly
   - Check touch targets are appropriately sized
   - Test mobile navigation

### 6. Performance Testing

1. **Lighthouse Audit:**
   - Run Chrome DevTools Lighthouse audit
   - Aim for scores ≥ 90 in all categories

2. **Load Testing:**
   - Test with multiple concurrent users
   - Monitor API response times

### 7. Accessibility Testing

1. **Keyboard Navigation:**
   - Verify all interactive elements are keyboard accessible
   - Test tab order and focus states

2. **Screen Reader Testing:**
   - Use VoiceOver (Mac) or NVDA (Windows)
   - Verify proper ARIA attributes and semantic HTML

### 8. Error Handling Testing

1. **Network Errors:**
   - Use Chrome DevTools to simulate offline mode
   - Verify graceful error handling

2. **Invalid Inputs:**
   - Test form validation
   - Test file upload with invalid file types

## ✅ Verification Checklist

- [ ] Backend server starts successfully
- [ ] Frontend server starts successfully
- [ ] API endpoints respond correctly
- [ ] Authentication flow works (signup/login/logout)
- [ ] Theme toggle functionality works
- [ ] Navigation between all pages works
- [ ] Mock document upload shows progress
- [ ] Mock API key generation works
- [ ] Usage analytics charts display correctly
- [ ] Profile page shows user information
- [ ] Responsive design works on all screen sizes
- [ ] Error handling is graceful
- [ ] Performance is acceptable
- [ ] Accessibility standards are met

## 🐛 Common Issues and Solutions

### Issue: Firebase Authentication Errors
**Solution:**
- Verify Firebase configuration in `.env` file
- Ensure Firebase project is properly set up
- Check browser console for detailed errors

### Issue: CORS Errors
**Solution:**
- Ensure backend has CORS middleware enabled
- Verify frontend API base URL matches backend server URL

### Issue: Theme Not Persisting
**Solution:**
- Check localStorage permissions in browser
- Verify ThemeContext implementation

### Issue: Charts Not Displaying
**Solution:**
- Ensure Chart.js dependencies are installed
- Check for console errors related to chart data

### Issue: Build Failures
**Solution:**
- Run `npm install` in both backend and frontend
- Check for version conflicts in package.json
- Clear node_modules and reinstall dependencies

## 📝 Notes

- This is a development/testing setup
- For production, additional security measures should be implemented
- All API calls are mocked in the frontend - connect to real backend endpoints for full functionality
- Firebase and other service configurations need to be properly set up for production use
