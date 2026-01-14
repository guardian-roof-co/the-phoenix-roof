const { Storage } = require('@google-cloud/storage');
const path = require('path');

async function checkBucket() {
    try {
        const storage = new Storage({
            keyFilename: path.join(__dirname, 'gcs-key.json'),
            projectId: 'guardian-478113'
        });
        const [buckets] = await storage.getBuckets();
        console.log('Available buckets:');
        buckets.forEach(b => console.log(`- ${b.name}`));

        const bucketName = 'west-michigan-roof';
        const [exists] = await storage.bucket(bucketName).exists();
        console.log(`\nBucket "${bucketName}" exists: ${exists}`);
    } catch (err) {
        console.error('Error checking bucket:', err.message);
    }
}

checkBucket();
