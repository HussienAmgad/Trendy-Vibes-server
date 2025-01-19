const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 8080;

// Middleware لتفسير الجسم كـ JSON
app.use(express.json());
app.use(cors());

// إعداد اتصال MongoDB
const uri = "mongodb+srv://hussienamgad123:eWnRKwUqLkr2rmPZ@cluster0.fkxjm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// الاتصال بقاعدة البيانات عند بدء التشغيل
client.connect()
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// نقطة النهاية لإضافة منتج جديد
app.post('/add-product', async (req, res) => {
  try {
    const { name, description, imageUrls, priceBefore, priceAfter, department, colors, productUrl } = req.body;

    if (!name || !description || !priceBefore || !priceAfter || !department || !colors || !productUrl) {
      return res.status(400).send("Missing required fields");
    }

    const database = client.db("trendyvibes");
    const collection = database.collection("products");

    const newProduct = {
      name,
      description,
      imageUrls,
      priceBefore,
      priceAfter,
      department,
      colors,
      productUrl,
    };

    const result = await collection.insertOne(newProduct);
    res.status(201).json({ message: "Product added successfully", productId: result.insertedId });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// بقية نقاط النهاية كما هي...

// نقطة النهاية الرئيسية (الافتراضية) لفحص الحالة
app.get('/', (req, res) => {
  res.send('Server is running...');
});

// تشغيل الخادم (للاستخدام المحلي فقط)
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => console.log(`Listening to port ${port}`));
}

// تصدير التطبيق لـ Vercel
module.exports = app;
