# 🔧 Zuba Soil Sense - Connection Troubleshooting Guide

## ✅ Current Status (GOOD NEWS!)

Based on our diagnostics:

- ✅ **Backend is RUNNING** and responding correctly on `http://127.0.0.1:8000`
- ✅ **Frontend is RUNNING** and responding correctly on `http://127.0.0.1:5173`
- ✅ **API endpoints are working** - all tests passed
- ✅ **CORS is configured** to allow all origins during development

## 🌐 Access Your Application

1. **Open your web browser**
2. **Navigate to**: `http://localhost:5173` or `http://127.0.0.1:5173`
3. **Check the connection status** in the web interface

## 🔍 If Frontend Still Shows "API Disconnected"

### Step 1: Check Browser Console
1. Open your browser's Developer Tools (F12)
2. Go to the **Console** tab
3. Look for any error messages (they should show detailed logging)
4. Check the **Network** tab to see if API requests are being made

### Step 2: Verify API Endpoints Manually
Open these URLs directly in your browser:
- `http://localhost:8000/health` - Should show backend health status
- `http://localhost:8000/latest` - Should show sensor data (mock data)
- `http://localhost:8000/docs` - Should show API documentation

### Step 3: Common Issues & Solutions

#### Issue: CORS Errors
**Symptoms**: Console shows "CORS policy" errors
**Solution**: ✅ Already fixed - CORS is set to allow all origins

#### Issue: Network Connection Refused
**Symptoms**: Console shows "Failed to fetch" or connection refused
**Solution**: 
- Make sure both servers are running
- Try refreshing the browser page
- Clear browser cache (Ctrl+F5)

#### Issue: Firewall Blocking
**Symptoms**: Requests timeout or are blocked
**Solution**: 
- Check if Windows Firewall is blocking Python or Node.js
- Temporarily disable firewall to test
- Add exceptions for ports 8000 and 5173

#### Issue: Different Localhost Resolution
**Symptoms**: Some requests work, others don't
**Solution**: 
- Try both `http://localhost:5173` and `http://127.0.0.1:5173`
- Use the IP address version if hostname doesn't work

## 🔧 Manual Testing Commands

Run these in PowerShell/Command Prompt to verify connectivity:

```powershell
# Test backend health
curl http://localhost:8000/health

# Test backend sensor data
curl http://localhost:8000/latest

# Test frontend loading
curl http://localhost:5173
```

## 📊 Expected Behavior

When working correctly, you should see:
- ✅ Green "API Connected" status in the frontend
- 🔄 Live sensor data updating every 5 seconds
- 📈 Real-time charts and graphs
- 🌡️ Temperature, moisture, and NPK readings

## 🚀 Quick Restart (If Needed)

If you need to restart everything:

1. **Stop all servers** (Ctrl+C in their terminal windows)
2. **Run the startup script**:
   ```powershell
   python start_zuba.py
   ```
   Choose option 3 (Start both servers)

## 📞 Still Having Issues?

1. **Check the browser console logs** (F12 → Console)
2. **Look at the diagnostic output** from `python diagnose_connection.py`
3. **Try a different browser** (Chrome, Firefox, Edge)
4. **Restart your computer** (sometimes network stack needs refresh)

## 🎯 Success Indicators

You'll know everything is working when:
- Frontend loads without errors
- Connection status shows green "Connected"
- Data updates every few seconds
- Charts show real-time information
- No console errors in browser

---

**Your system is already set up correctly! The issue is likely a simple browser or caching problem.**
