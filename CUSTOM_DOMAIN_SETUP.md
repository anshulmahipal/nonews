# 🌐 Custom Domain Setup for Firebase Hosting

Complete guide to setting up your custom domain (like `nonews.com` or `www.nonews.com`) for your Firebase Hosting site.

---

## 📋 Prerequisites

Before you begin, make sure you have:
- ✅ A registered domain name (from GoDaddy, Namecheap, Google Domains, etc.)
- ✅ Access to your domain's DNS settings
- ✅ Your Firebase Hosting site already deployed
- ✅ Admin access to Firebase Console

---

## 🚀 Setup Process (Two Methods)

### Method 1: Using Firebase Console (Easiest)

This is the recommended method for most users.

#### Step 1: Access Firebase Hosting

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your **noNews** project
3. Click **Hosting** in the left sidebar
4. Click the **"Add custom domain"** button

#### Step 2: Enter Your Domain

You have two options:

**Option A: Root Domain (Recommended)**
```
nonews.com
```
- Cleaner look
- Firebase will auto-add `www.nonews.com` redirect

**Option B: Subdomain**
```
www.nonews.com
```
- Traditional approach
- You'll need to redirect root domain separately

**💡 Tip:** Choose root domain (`nonews.com`) - Firebase handles both automatically!

#### Step 3: Verify Domain Ownership

Firebase will provide a **TXT record** for verification.

**Example TXT record:**
```
Host: @
Type: TXT
Value: firebase=your-verification-code-here
```

**Add this to your domain's DNS settings:**

##### For GoDaddy:
1. Go to [GoDaddy DNS Management](https://dcc.godaddy.com/manage/dns)
2. Find your domain
3. Click **DNS** → **Add Record**
4. Select **TXT** record
5. Host: `@`
6. TXT Value: `firebase=your-code`
7. Click **Save**

##### For Namecheap:
1. Go to Domain List → Manage → Advanced DNS
2. Click **Add New Record**
3. Type: **TXT Record**
4. Host: `@`
5. Value: `firebase=your-code`
6. TTL: Automatic
7. Click **Save**

##### For Google Domains:
1. Go to [Google Domains](https://domains.google.com)
2. Click on your domain
3. Click **DNS** in the left menu
4. Scroll to **Custom resource records**
5. Name: Leave blank (for root) or `@`
6. Type: **TXT**
7. Data: `firebase=your-code`
8. Click **Add**

##### For Cloudflare:
1. Log in to [Cloudflare](https://dash.cloudflare.com)
2. Select your domain
3. Click **DNS** tab
4. Click **Add record**
5. Type: **TXT**
6. Name: `@`
7. Content: `firebase=your-code`
8. Click **Save**

#### Step 4: Wait for Verification (Can take up to 24 hours)

```bash
# Check if TXT record is propagated
dig TXT nonews.com

# Or use online tool:
# https://mxtoolbox.com/TXTLookup.aspx
```

**Firebase will automatically verify within 24 hours.** You'll get an email when verified.

#### Step 5: Add DNS A Records

After verification, Firebase will show you **A records** to add:

**Example A records:**
```
Host: @
Type: A
Value: 151.101.1.195

Host: @
Type: A
Value: 151.101.65.195
```

**Add these to your DNS settings:**

##### For GoDaddy:
1. DNS Management → Add Record
2. Type: **A**
3. Host: `@`
4. Points to: `151.101.1.195`
5. Save and repeat for second IP

##### For Namecheap:
1. Advanced DNS → Add New Record
2. Type: **A Record**
3. Host: `@`
4. Value: `151.101.1.195`
5. Save and repeat for second IP

##### For Google Domains / Cloudflare:
- Same process as above

#### Step 6: Add WWW Subdomain (Automatic)

Firebase automatically creates a redirect from `www` to your root domain.

If you want to configure it manually, add these **CNAME** records:

```
Host: www
Type: CNAME
Value: nonews.com
```

#### Step 7: Wait for SSL Certificate (Automatic)

Firebase automatically provisions a free **SSL/TLS certificate** from Let's Encrypt.

- ⏱️ Usually takes **a few minutes to a few hours**
- 🔒 Your site will be accessible via HTTPS
- 🔄 Auto-renews before expiration

---

### Method 2: Using Firebase CLI

For advanced users who prefer command line.

```bash
# Add custom domain
firebase hosting:channel:deploy production --custom-domain nonews.com

# Follow the prompts to add DNS records
```

---

## 🔍 Verification & Testing

### Check DNS Propagation

```bash
# Check A records
dig A nonews.com

# Check TXT record
dig TXT nonews.com

# Check CNAME for www
dig CNAME www.nonews.com

# Or use online tools:
# https://dnschecker.org
# https://www.whatsmydns.net
```

### Test Your Domain

```bash
# Test HTTP (should redirect to HTTPS)
curl -I http://nonews.com

# Test HTTPS
curl -I https://nonews.com

# Test WWW redirect
curl -I https://www.nonews.com
```

### Expected Results

✅ **http://nonews.com** → Redirects to **https://nonews.com**
✅ **https://nonews.com** → Shows your site with SSL
✅ **https://www.nonews.com** → Redirects to **https://nonews.com**

---

## 📊 DNS Configuration Summary

Here's a complete overview of DNS records you need:

```dns
# Verification (Remove after verified)
Type: TXT
Host: @
Value: firebase=your-verification-code

# Root domain
Type: A
Host: @
Value: 151.101.1.195

Type: A
Host: @
Value: 151.101.65.195

# WWW subdomain (optional - Firebase handles this)
Type: CNAME
Host: www
Value: nonews.com
```

---

## ⏱️ DNS Propagation Timeline

| Action | Typical Time | Max Time |
|--------|--------------|----------|
| Add TXT record | 5-30 minutes | 24 hours |
| Verify domain | Instant after propagation | 24 hours |
| Add A records | 5-30 minutes | 48 hours |
| SSL certificate | 15 minutes - 2 hours | 24 hours |
| Full propagation | 1-2 hours | 48 hours |

**💡 Tip:** DNS changes can take time. Be patient!

---

## 🔒 SSL/TLS Certificate

### Automatic Certificate

Firebase automatically provisions SSL certificates:
- 🆓 **Free** - No cost
- 🔄 **Auto-renewal** - No maintenance
- 🔐 **Industry-standard** - Let's Encrypt certificates
- 🌐 **Wildcard support** - Covers www subdomain

### Check SSL Status

1. Go to Firebase Console → Hosting
2. Look for your domain
3. Status should show: **"Connected"** with 🔒 icon

### Force HTTPS

Firebase automatically redirects HTTP → HTTPS. No configuration needed!

---

## 🐛 Troubleshooting

### Issue 1: "Domain verification pending"

**Cause:** TXT record not propagated or incorrect

**Solution:**
```bash
# Check if TXT record exists
dig TXT nonews.com

# Wait 1-2 hours and try again
# Clear DNS cache (on Mac)
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
```

### Issue 2: "DNS configuration incorrect"

**Cause:** A records not added or pointing to wrong IPs

**Solution:**
1. Double-check A record values in Firebase Console
2. Ensure you're using the exact IPs provided
3. Remove any conflicting A records
4. Wait for DNS propagation

### Issue 3: "Certificate provisioning failed"

**Cause:** Usually DNS issues or domain not verified

**Solution:**
1. Ensure domain is verified ✓
2. Check A records are correct
3. Wait 24 hours
4. If still failing, remove and re-add domain

### Issue 4: "Site shows 404 Not Found"

**Cause:** Domain pointing to wrong Firebase project or not deployed

**Solution:**
```bash
# Verify deployment
firebase hosting:sites:list

# Redeploy
firebase deploy --only hosting

# Check firebase.json has correct configuration
```

### Issue 5: "Mixed content warnings"

**Cause:** Loading HTTP resources on HTTPS page

**Solution:**
- Update all links to use HTTPS
- Check `public/index.html` and `public/app.js`
- Ensure Firebase CDN links use HTTPS

### Issue 6: "WWW not working"

**Cause:** CNAME not configured

**Solution:**
Firebase handles this automatically, but if issues persist:
```dns
Type: CNAME
Host: www
Value: nonews.com (or use Firebase-provided value)
```

### Issue 7: "SSL certificate invalid"

**Cause:** Certificate still provisioning or domain misconfigured

**Solution:**
1. Wait 24 hours for certificate
2. Check DNS records are correct
3. Visit Firebase Console → Hosting to see status
4. If stuck, remove and re-add domain

---

## 🎯 Common DNS Provider Instructions

### GoDaddy Complete Setup

1. **Log in to GoDaddy**
2. **My Products** → Find your domain
3. **DNS** → **Manage Zones**
4. **Add Record:**
   - **TXT Record:**
     - Type: TXT
     - Name: @
     - Value: `firebase=your-code`
     - TTL: 1 Hour
   - **A Records (after verification):**
     - Type: A
     - Name: @
     - Value: `151.101.1.195`
     - TTL: 1 Hour
     - (Add second A record with second IP)

### Namecheap Complete Setup

1. **Log in to Namecheap**
2. **Domain List** → **Manage**
3. **Advanced DNS**
4. **Add New Record:**
   - **TXT Record:**
     - Type: TXT Record
     - Host: @
     - Value: `firebase=your-code`
     - TTL: Automatic
   - **A Records (after verification):**
     - Type: A Record
     - Host: @
     - Value: `151.101.1.195`
     - TTL: Automatic
     - (Add second A record with second IP)

### Cloudflare Complete Setup

1. **Log in to Cloudflare**
2. **Select domain**
3. **DNS tab**
4. **Add record:**
   - **TXT Record:**
     - Type: TXT
     - Name: @
     - Content: `firebase=your-code`
     - Proxy: OFF (DNS only)
   - **A Records (after verification):**
     - Type: A
     - Name: @
     - IPv4 address: `151.101.1.195`
     - Proxy: OFF (DNS only) - Important!
     - (Add second A record with second IP)

**⚠️ Important for Cloudflare:** Turn OFF proxy (orange cloud) or SSL certificates may not work!

---

## 🔧 Advanced Configuration

### Multiple Domains

Point multiple domains to same site:

```bash
# Add second domain
firebase hosting:channel:deploy production --custom-domain example.com

# In Firebase Console, add:
# - nonews.com (primary)
# - example.com (redirect to primary)
```

### Subdomain for Staging

```bash
# Add staging subdomain
firebase hosting:channel:deploy staging --custom-domain staging.nonews.com
```

DNS:
```dns
Type: A
Host: staging
Value: [Firebase IPs]
```

### Email on Same Domain

If you want email@nonews.com, add MX records:

```dns
Type: MX
Host: @
Value: [Your email provider's MX records]
Priority: 10
```

This won't conflict with Firebase A records.

---

## ✅ Post-Setup Checklist

After setup is complete:

- [ ] Domain shows your waitlist page
- [ ] HTTPS works (🔒 in browser)
- [ ] HTTP redirects to HTTPS
- [ ] www redirects to root (or vice versa)
- [ ] No SSL certificate warnings
- [ ] Check on mobile device
- [ ] Test from different locations/devices
- [ ] Update social media links
- [ ] Update email signatures
- [ ] Submit to Google Search Console
- [ ] Add to Firebase Performance Monitoring

---

## 📈 Next Steps

### 1. Update Your Firebase Config

No changes needed! Custom domain works automatically.

### 2. Update Social Media

Update your links on:
- Twitter/X profile
- Instagram bio
- LinkedIn
- Facebook page
- Email signature

### 3. Add to Google Search Console

```
1. Go to https://search.google.com/search-console
2. Add property: https://nonews.com
3. Verify using DNS TXT record
4. Submit sitemap (if you have one)
```

### 4. Set Up Analytics

Update Google Analytics if you're using it:

```html
<!-- In public/index.html -->
<script>
  gtag('config', 'GA_MEASUREMENT_ID', {
    'page_path': window.location.pathname
  });
</script>
```

### 5. Monitor Performance

```bash
# Check site performance
firebase hosting:channel:list

# View analytics in Firebase Console
# Hosting → View traffic
```

---

## 📞 Getting Help

### Check Status

1. **Firebase Console** → Hosting → Your domain
   - Should show "Connected" with 🔒 icon

2. **Run diagnostics:**
```bash
# Check DNS
dig nonews.com

# Check SSL
openssl s_client -connect nonews.com:443 -servername nonews.com

# Check HTTP headers
curl -I https://nonews.com
```

### Firebase Support

- [Firebase Support](https://firebase.google.com/support)
- [Hosting Documentation](https://firebase.google.com/docs/hosting/custom-domain)
- [Community Forum](https://groups.google.com/forum/#!forum/firebase-talk)

### DNS Tools

- [DNS Checker](https://dnschecker.org) - Check global propagation
- [What's My DNS](https://www.whatsmydns.net) - DNS lookup
- [MX Toolbox](https://mxtoolbox.com) - DNS diagnostics
- [SSL Labs](https://www.ssllabs.com/ssltest/) - SSL test

---

## 🎓 Best Practices

1. ✅ **Use root domain** (`nonews.com`) - Cleaner and Firebase handles www
2. ✅ **Wait patiently** - DNS can take 24-48 hours
3. ✅ **Keep TXT record** - Some providers recommend keeping verification record
4. ✅ **Monitor SSL expiry** - Firebase auto-renews but monitor in console
5. ✅ **Use HTTPS everywhere** - Update all links to use HTTPS
6. ✅ **Test thoroughly** - Check on multiple devices and networks
7. ✅ **Document your DNS** - Keep record of your DNS settings

---

## 🚨 Important Notes

- **Don't delete TXT verification record** - Some providers may re-verify
- **A record IPs may change** - Check Firebase Console for current IPs
- **SSL takes time** - Certificate provisioning can take up to 24 hours
- **Cloudflare users** - Turn OFF proxy mode for Firebase domains
- **Backup DNS settings** - Screenshot your DNS before making changes

---

## 📝 Quick Reference

```bash
# Check domain status
firebase hosting:sites:list

# Check DNS
dig A nonews.com
dig TXT nonews.com

# Test HTTPS
curl -I https://nonews.com

# Test redirect
curl -I http://nonews.com

# Check SSL certificate
openssl s_client -connect nonews.com:443 | grep subject
```

---

**Your custom domain setup is complete when you see:**
✅ Green "Connected" status in Firebase Console
✅ 🔒 Secure padlock in browser
✅ No SSL warnings
✅ Your waitlist page loads on your domain

---

**Questions? Check the troubleshooting section above or visit [Firebase Hosting Docs](https://firebase.google.com/docs/hosting/custom-domain)**

