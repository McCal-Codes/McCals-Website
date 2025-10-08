# Google Vision API Setup with Service Account

## ⚠️ Important: Billing Required

**Google Cloud Vision API requires billing to be enabled on your project.** If you see a "PERMISSION_DENIED" error mentioning billing, you need to:

1. Visit https://console.developers.google.com/billing
2. Enable billing for project `opportune-balm-474513-j5`
3. Wait a few minutes for the change to propagate
4. Try the API again

## ✅ Service Account Already Configured

Your Google Cloud service account is already set up! The key file `google-service-account.json` is saved securely in this directory.

**Service Account Details:**
- Project: `opportune-balm-474513-j5`
- Email: `mccal-website-images@opportune-balm-474513-j5.iam.gserviceaccount.com`
- Status: Ready to use

## 🚀 Quick Start with Service Account

### 1. Install Dependencies
```bash
cd src/site/prototypes/vision-api
npm install
```

### 2. Start the Vision API Proxy
```bash
# From the vision-api directory
npm start
# or
node vision-api-proxy.js
```

The proxy will run on `http://localhost:3003`

### 3. Test the Integration

1. Make sure your dev server is running: `npm run dev` (on port 3002)
2. Open: `http://localhost:3002/src/site/prototypes/vision-api/index.html`
3. Select "Browse Portfolio" mode
4. Choose "Google Vision API" from the dropdown
5. Select an image and click "Analyze Image"

The frontend will automatically connect to your proxy server and use the service account for authentication.

## 🔧 How It Works

```
Browser → Frontend → Proxy Server → Google Vision API
                    ↓
         Service Account Auth
```

- **Frontend**: Sends base64 image data to proxy
- **Proxy**: Uses your service account to authenticate with Google Vision API
- **Google Vision**: Analyzes the image and returns results
- **Proxy**: Formats the response for the frontend

## 📊 API Features Enabled

Your service account enables these Google Vision features:
- **Label Detection**: Identifies objects, scenes, and activities
- **Object Localization**: Finds and locates objects in images
- **Text Detection**: Extracts text from images (OCR)
- **Color Analysis**: Identifies dominant colors

## 🛡️ Security Notes

- Service account key is stored locally (not committed to git)
- Proxy server runs locally for development
- In production, deploy proxy to a secure server
- Never expose service account credentials in client-side code

## 🔄 Alternative: API Key Approach

If you prefer not to run a proxy server, you can use an API key instead:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the Vision API
3. Create an API key in "Credentials"
4. Replace the `googleVisionAnalysis()` method in `vision-api.js` with the API key version

However, the service account approach is more secure and recommended for production.

## Quick Setup Options

### Option 1: Google Vision API (Recommended for Production)

1. **Create Google Cloud Project**
   ```bash
   # Visit: https://console.cloud.google.com/
   # Create new project or select existing
   ```

2. **Enable Vision API**
   - Go to "APIs & Services" > "Library"
   - Search for "Cloud Vision API"
   - Click "Enable"

3. **Create API Key**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the key (keep it secure!)

4. **Add to Prototype**
   ```javascript
   // In vision-api.js, update googleVisionAnalysis()
   async googleVisionAnalysis() {
     const API_KEY = 'your-google-api-key-here';
     const API_URL = `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`;

     // Convert image to base64
     const base64Image = await this.fileToBase64(this.selectedFile);

     const response = await fetch(API_URL, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         requests: [{
           image: { content: base64Image },
           features: [
             { type: 'LABEL_DETECTION', maxResults: 10 },
             { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
             { type: 'TEXT_DETECTION' },
             { type: 'IMAGE_PROPERTIES' }
           ]
         }]
       })
     });

     const data = await response.json();
     return this.parseGoogleVisionResponse(data);
   }
   ```

### Option 2: Azure Computer Vision

1. **Create Azure Resource**
   ```bash
   # Visit: https://portal.azure.com/
   # Create "Computer Vision" resource
   ```

2. **Get Credentials**
   - Copy Endpoint URL and API Key from Azure portal

3. **Add to Prototype**
   ```javascript
   // In vision-api.js, update azureVisionAnalysis()
   async azureVisionAnalysis() {
     const ENDPOINT = 'https://your-resource.cognitiveservices.azure.com/';
     const API_KEY = 'your-azure-api-key';

     const response = await fetch(`${ENDPOINT}vision/v3.2/analyze?visualFeatures=Tags,Objects,Description`, {
       method: 'POST',
       headers: {
         'Ocp-Apim-Subscription-Key': API_KEY,
         'Content-Type': 'application/octet-stream'
       },
       body: await this.selectedFile.arrayBuffer()
     });

     const data = await response.json();
     return this.parseAzureVisionResponse(data);
   }
   ```

### Option 3: OpenAI Vision (GPT-4 Vision)

1. **Get OpenAI API Key**
   ```bash
   # Visit: https://platform.openai.com/api-keys
   # Create new API key
   ```

2. **Add to Prototype**
   ```javascript
   // In vision-api.js, update openAIVisionAnalysis()
   async openAIVisionAnalysis() {
     const API_KEY = 'your-openai-api-key';

     // Convert image to base64
     const base64Image = await this.fileToBase64(this.selectedFile);

     const response = await fetch('https://api.openai.com/v1/chat/completions', {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${API_KEY}`,
         'Content-Type': 'application/json'
       },
       body: JSON.stringify({
         model: 'gpt-4-vision-preview',
         messages: [{
           role: 'user',
           content: [
             { type: 'text', text: 'Analyze this image and describe what you see, including objects, colors, and any text.' },
             { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
           ]
         }],
         max_tokens: 500
       })
     });

     const data = await response.json();
     return this.parseOpenAIResponse(data);
   }
   ```

## Helper Methods to Add

Add these utility methods to the VisionAPIPrototype class:

```javascript
// Convert file to base64
async fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Parse Google Vision response
parseGoogleVisionResponse(data) {
  const response = data.responses[0];
  return {
    labels: response.labelAnnotations?.map(label => ({
      description: label.description,
      confidence: label.score
    })) || [],
    objects: response.localizedObjectAnnotations?.map(obj => ({
      name: obj.name,
      confidence: obj.score
    })) || [],
    text: response.textAnnotations?.[0]?.description || null,
    colors: response.imagePropertiesAnnotation?.dominantColors?.colors?.map(color => ({
      color: this.rgbToColorName(color.color),
      percentage: Math.round(color.pixelFraction * 100)
    })) || []
  };
}

// Parse Azure Vision response
parseAzureVisionResponse(data) {
  return {
    labels: data.tags?.map(tag => ({
      description: tag.name,
      confidence: tag.confidence
    })) || [],
    objects: data.objects?.map(obj => ({
      name: obj.object,
      confidence: obj.confidence
    })) || [],
    text: data.description?.captions?.[0]?.text || null,
    colors: [] // Azure doesn't provide color analysis in basic analyze
  };
}

// Parse OpenAI response
parseOpenAIResponse(data) {
  const content = data.choices[0]?.message?.content || '';
  // Parse the descriptive text - you might want to use more structured prompts
  return {
    labels: [], // Would need to parse from description
    objects: [],
    text: content,
    colors: []
  };
}

// Simple RGB to color name (basic implementation)
rgbToColorName(color) {
  const r = color.red || 0;
  const g = color.green || 0;
  const b = color.blue || 0;

  if (r > 200 && g < 100 && b < 100) return 'Red';
  if (r < 100 && g > 200 && b < 100) return 'Green';
  if (r < 100 && g < 100 && b > 200) return 'Blue';
  if (r > 200 && g > 200 && b < 100) return 'Yellow';
  if (r > 200 && g < 100 && b > 200) return 'Magenta';
  if (r < 100 && g > 200 && b > 200) return 'Cyan';
  if (r > 200 && g > 200 && b > 200) return 'White';
  if (r < 50 && g < 50 && b < 50) return 'Black';
  return 'Gray';
}
```

## Security Considerations

- **Never commit API keys** to version control
- Use environment variables or secure config files
- Implement rate limiting and error handling
- Consider API costs and usage limits

## Next Steps for Integration

1. **Test with Real APIs** - Implement one API at a time
2. **Add Error Handling** - Network failures, rate limits, invalid responses
3. **Optimize Performance** - Image resizing, caching, batch processing
4. **Integrate with Portfolio** - Add vision analysis to existing gallery features
5. **Add Caching** - Store analysis results to avoid repeated API calls

## Cost Comparison

- **Google Vision**: $1.50 per 1000 images (basic analysis)
- **Azure Computer Vision**: $1.00 per 1000 images
- **OpenAI Vision**: $0.0016 per image (GPT-4 Vision)

Choose based on your needs, existing cloud provider preferences, and required features.