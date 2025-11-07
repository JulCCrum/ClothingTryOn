# FitMirror - AI-Powered Virtual Try-On

FitMirror is a web application that uses AI to let you virtually try on clothing. Upload photos of yourself from multiple angles, select a clothing item, and see how it looks on you!

## Features

- 📸 **Multi-angle photo capture** - Upload photos from front, back, left, and right angles
- 👕 **Virtual try-on** - See how clothing items look on you using AI
- 🖼️ **Multiple input methods** - Upload product images or use URLs
- 💾 **Local storage** - Your photos are stored locally in your browser (IndexedDB)
- 📱 **Responsive design** - Works on desktop and mobile devices

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- A **Replicate API key** (required for the virtual try-on feature)

## Getting Your API Key

### Replicate API Key (Required)

1. Go to [Replicate](https://replicate.com/)
2. Sign up for a free account or log in
3. Navigate to your [API tokens page](https://replicate.com/account/api-tokens)
4. Create a new token or copy your existing token
5. Save this token - you'll need it in the setup steps below

**Note:** Replicate offers free credits for new users. After that, you'll be charged based on usage. The IDM-VTON model costs approximately $0.01-0.02 per image generation.

## Installation

1. **Clone or download this repository**

   ```bash
   git clone <repository-url>
   cd fitmirror
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```bash
   cp .env.local.example .env.local
   ```

   Open `.env.local` and add your Replicate API token:

   ```env
   # Replicate API Key (REQUIRED for virtual try-on)
   REPLICATE_API_TOKEN=your_replicate_api_token_here
   ```

   Replace `your_replicate_api_token_here` with your actual Replicate API token.

## Running the Application

1. **Start the development server**

   ```bash
   npm run dev
   ```

2. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

3. **Start using FitMirror!**

   - Upload photos of yourself from 4 angles (front, back, left, right)
   - Upload a product image or paste a product image URL
   - Click "Generate Try-On" and wait 2-3 minutes for AI processing
   - View your results and download your favorite angles!

## Usage Guide

### Step 1: Upload Your Photos

1. Take or select photos of yourself from four angles:
   - **Front view** - facing the camera
   - **Back view** - back to the camera
   - **Left side** - left side facing the camera
   - **Right side** - right side facing the camera

2. Upload each photo in the onboarding screen
3. Your photos are stored locally in your browser

**Tips for best results:**
- Wear form-fitting clothes in neutral colors
- Stand in good lighting with a plain background
- Keep arms slightly away from your body
- Stand straight and centered in the frame

### Step 2: Select a Product

You have two options:

**Option A: Upload an image**
- Click "Upload Screenshot"
- Select a product image from your computer
- Supports JPG, PNG, and HEIC formats

**Option B: Use a URL**
- Right-click on a product image online
- Select "Copy Image Address" (not the page URL!)
- Paste the direct image URL (should end in .jpg, .png, etc.)

**Note:** Product page URLs (like Amazon or shopping sites) won't work due to anti-bot protection. You need the direct image URL.

### Step 3: Generate Try-On

1. Click "Generate Try-On"
2. Wait 2-3 minutes while AI processes your images
3. View your results from all four angles
4. Download your favorite images or share them!

## Troubleshooting

### "Failed to fetch image from URL (403 Forbidden)"

**Problem:** The website is blocking access to the image.

**Solution:**
- Right-click the product image and select "Copy Image Address"
- Use the direct image URL (ending in .jpg, .png, etc.)
- Or download the image and upload it instead

### "Product image is required"

**Problem:** No product image or URL was provided.

**Solution:** Make sure you either upload an image or paste a valid image URL.

### Virtual try-on not working

**Problem:** The generated images look identical to your original photos.

**Solution:**
- Verify your Replicate API token is correct in `.env.local`
- Restart the development server after changing environment variables
- Check the console for error messages

### Port 3000 is already in use

**Problem:** Another application is using port 3000.

**Solution:**
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or run on a different port
npm run dev -- -p 3001
```

### Images not displaying

**Problem:** Results page shows loading or blank images.

**Solution:**
- Clear your browser cache
- Clear the Next.js cache: `rm -rf .next`
- Restart the development server

## Project Structure

```
fitmirror/
├── app/
│   ├── api/
│   │   └── tryon/
│   │       └── route.ts          # Virtual try-on API endpoint
│   ├── onboarding/
│   │   └── page.tsx              # Photo upload page
│   ├── upload/
│   │   └── page.tsx              # Product selection page
│   ├── results/
│   │   └── page.tsx              # Results display page
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── lib/
│   ├── db.ts                     # IndexedDB helpers
│   └── firebase.ts               # Firebase config (optional)
├── components/                   # Reusable components
├── .env.local                    # Environment variables (create this)
├── .env.local.example            # Environment variables template
├── package.json                  # Dependencies
└── README.md                     # This file
```

## Technologies Used

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Replicate** - AI model hosting (IDM-VTON model)
- **IndexedDB** - Browser-based storage for images
- **heic-convert** - HEIC to JPEG conversion

## Build for Production

To create an optimized production build:

```bash
npm run build
npm start
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Deployment

This Next.js app can be deployed to:

- **Vercel** (recommended) - [Deploy with Vercel](https://vercel.com/new)
- **Netlify** - [Deploy with Netlify](https://www.netlify.com/)
- **Railway** - [Deploy with Railway](https://railway.app/)
- Any Node.js hosting platform

**Important:** Don't forget to add your `REPLICATE_API_TOKEN` environment variable in your deployment platform's settings!

## Limitations

- Virtual try-on takes 2-3 minutes per generation (4 angles)
- Works best with form-fitting base clothing in your photos
- Product images should show the clothing item clearly
- HEIC images are automatically converted (may take extra time)
- Replicate API has usage costs after free credits

## Privacy & Data

- All photos are stored **locally in your browser** using IndexedDB
- Photos are **never uploaded to our servers permanently**
- Images are sent to Replicate API for processing and immediately discarded
- You can clear your photos anytime by clicking "Clear body photos"

## License

ISC

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review the browser console for error messages
3. Ensure your Replicate API token is valid and has credits

---

Built with ❤️ using Next.js and AI
