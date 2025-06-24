# Yoga for PE - Vimeo OTT Video Upload Workflow

This guide will help you upload your 37 videos to Vimeo OTT and organize them into the correct subscription tiers.

## Step 1: Generate a CSV file with your videos

The first step is to generate a CSV file containing all your videos and their metadata. We've created a script that will scan your video directories and create this file for you.

```bash
node scripts/generate-video-csv.js
```

When prompted, enter the path to your videos: `D:\Videos Ready for Subscription 662025`

This will create a file called `yoga-videos.csv` in your project directory.

## Step 2: Edit the CSV file

Open the generated CSV file in Excel or any spreadsheet application. For each video, review and edit:

1. **title** - Make sure the title is descriptive and properly formatted
2. **description** - Add a detailed description for each video
3. **category** - Choose from: `meditation`, `yoga-for-pe`, or `relaxation`
4. **level** - Choose from: `Beginner`, `Intermediate`, or `Advanced`
5. **tier** - Choose from: `bronze` (free), `silver` ($7.99/month), or `gold` ($9.99/month)

Recommended tier assignments based on your folder structure:
- Free Videos → bronze tier
- Meditations → silver tier
- Mindful Movement → silver tier
- Relaxations → silver tier
- Yoga for PE → gold tier

Save the CSV file when you're done.

## Step 3: Install dependencies

Before running the upload script, make sure you have the required dependencies:

```bash
npm install vimeo csv-parse dotenv
```

## Step 4: Upload the videos

Now you can use the batch upload script to upload your videos:

```bash
node scripts/batch-video-upload.js
```

When prompted, enter the path to your CSV file: `yoga-videos.csv`

The script will:
1. Read the CSV file
2. Upload each video to Vimeo
3. Set the appropriate metadata (title, description, category, level)
4. Assign the video to the correct subscription tier
5. Show progress for each upload

## Step 5: Verify the uploads

After the uploads are complete:

1. Log in to your Vimeo OTT dashboard
2. Check that all videos have been uploaded with the correct metadata
3. Verify that videos are assigned to the correct subscription tiers
4. Test the videos on your website to ensure they play correctly

## Troubleshooting

If you encounter any issues:

- **Upload failures**: Check your internet connection and try uploading the failed videos again
- **API errors**: Verify your Vimeo API credentials in the `.env.local` file
- **Missing videos**: Make sure all video paths in the CSV file are correct
- **Access issues**: Verify that the subscription tier settings are correctly applied in Vimeo OTT

## Additional Resources

- [Vimeo OTT API Documentation](https://developer.vimeo.com/api/ott)
- [Vimeo Upload API Documentation](https://developer.vimeo.com/api/upload/videos)
