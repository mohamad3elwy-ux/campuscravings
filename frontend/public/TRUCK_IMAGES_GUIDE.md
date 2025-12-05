# How to Add Food Truck Images

## Option 1: Using Image URLs (Easiest)

1. **Find or upload images online** (e.g., Imgur, Cloudinary, or your own server)
2. **Update the server data** in `server-mock.js`:
   ```javascript
   {
     _id: 'truck1',
     name: 'Main Campus Grill',
     image: 'https://example.com/your-truck-image.jpg', // Add your image URL here
     // ... other fields
   }
   ```

## Option 2: Using Local Images

1. **Create an images folder** in `frontend/public/`:
   ```
   frontend/public/images/trucks/
   ```

2. **Add your images** to that folder:
   - `burger-truck.jpg`
   - `taco-truck.jpg`
   - `pizza-truck.jpg`

3. **Update the server data** in `server-mock.js`:
   ```javascript
   {
     _id: 'truck1',
     name: 'Main Campus Grill',
     image: '/images/trucks/burger-truck.jpg', // Path relative to public folder
     // ... other fields
   }
   ```

## Option 3: Using MongoDB (If using real database)

If you're using MongoDB instead of mock data, add an `image` field to your FoodTruck model and update it through the admin panel or API.

## Image Requirements

- **Recommended size**: 800x400px or larger
- **Aspect ratio**: 2:1 (width:height) works best
- **Formats**: JPG, PNG, or WebP
- **File size**: Keep under 500KB for fast loading

## Example Image URLs

You can use placeholder images for testing:
- `https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800` (Burger truck)
- `https://images.unsplash.com/photo-1565299585323-38174c3b7e0e?w=800` (Taco truck)
- `https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800` (Pizza truck)

## Fallback

If no image is provided or the image fails to load, the app will automatically show the purple gradient with an emoji as a fallback.

