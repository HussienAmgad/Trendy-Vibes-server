const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb'); // إضافة ObjectId هنا
const { default: axios } = require('axios');


const app = express();
const port = 8080 || process.env.PORT;

// Middleware لتفسير الجسم (body) كـ JSON
app.use(express.json());

const uri = "mongodb+srv://hussienamgad123:eWnRKwUqLkr2rmPZ@cluster0.fkxjm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// إضافة CORS كوسيط
app.use(cors());

// فتح اتصال MongoDB لمرة واحدة عند بدء الخادم
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
    
    // التحقق من البيانات المستلمة
    if (!name || !description || !priceBefore || !priceAfter || !department || !colors || !productUrl) {
      return res.status(400).send("Missing required fields");
    }

    const database = client.db("trendyvibes");
    const collection = database.collection("products");

    // إضافة البيانات إلى قاعدة البيانات
    const newProduct = {
      name,
      description,
      imageUrls,
      priceBefore,
      priceAfter,
      department,
      colors,
      productUrl,  // إضافة الرابط
    };

    const result = await collection.insertOne(newProduct);
    res.status(201).json({ message: "Product added successfully", productId: result.insertedId });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
app.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, priceBefore, priceAfter, imageUrls, department, colors, productUrl } = req.body;

    const database = client.db("trendyvibes");
    const collection = database.collection("products");

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          name,
          description,
          priceBefore,
          priceAfter,
          imageUrls,
          department,
          colors,
          productUrl,
        },
      }
    );

    if (result.modifiedCount > 0) {
      res.json({ message: "Product updated successfully!" });
    } else {
      res.status(404).json({ message: "Product not found!" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put('/order/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const database = client.db("trendyvibes");
    const collection = database.collection("orders");

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status,
        },
      }
    );

    if (result.modifiedCount > 0) {
      res.json({ message: "تم تعديل الطلب بنجاح!" });
    } else {
      res.status(404).json({ message: "الطلب غير موجود!" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

app.post('/orders', async (req, res) => {
  try {
    // إنشاء بيانات الطلب مع الحقول الإضافية
    const orderData = {
      customerName: req.body.customerName,
      customerPhone: req.body.customerPhone,
      additionalPhone: req.body.additionalPhone || null,
      address: req.body.address,
      governorate: req.body.governorate,
      notes: req.body.notes || '',
      statues: 'pinding',
      products: req.body.products,
      createdAt: new Date() // إضافة تاريخ الطلب
    };

    // إدخال الطلب إلى قاعدة البيانات
    const database = client.db("trendyvibes");
    const ordersCollection = database.collection("orders");
    const result = await ordersCollection.insertOne(orderData);

    // استجابة النجاح
    res.status(201).json({
      message: 'Order submitted successfully!',
      orderId: result.insertedId
    });
  } catch (error) {
    console.error("Error processing order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// نقطة النهاية لحذف منتج
app.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;  // الحصول على ID المنتج من المعاملات

    const database = client.db("trendyvibes");
    const collection = database.collection("products");

    // حذف المنتج بناءً على ID
    const result = await collection.deleteOne({ _id: new ObjectId(id) }); // استخدام ObjectId هنا

    if (result.deletedCount > 0) {
      res.json({ message: "Product deleted successfully!" });
    } else {
      res.status(404).json({ message: "Product not found!" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// نقطة النهاية لجلب منتج باستخدام ID
app.get('/order/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const database = client.db("trendyvibes");
    const collection = database.collection("orders");

    const product = await collection.findOne({ _id: new ObjectId(id) });  // استخدام ObjectId للبحث عن المنتج

    if (product) {
      res.json(product);  // إرجاع بيانات المنتج
    } else {
      res.status(404).send("Product not found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
app.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const database = client.db("trendyvibes");
    const collection = database.collection("products");

    const product = await collection.findOne({ _id: new ObjectId(id) });  // استخدام ObjectId للبحث عن المنتج

    if (product) {
      res.json(product);  // إرجاع بيانات المنتج
    } else {
      res.status(404).send("Product not found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
// نقطة النهاية للحصول على جميع المنتجات
app.post('/products', async (req, res) => {
  try {
    const database = client.db("trendyvibes");
    const collection = database.collection("products");
    const products = await collection.find({}).toArray();  // استخدام find بدلاً من findOne للحصول على جميع المنتجات

    if (products.length > 0) {
      res.json(products);  // إرسال جميع المنتجات في الرد
    } else {
      res.status(404).send("No products found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
app.post('/ordersadmin', async (req, res) => {
  try {
    const database = client.db("trendyvibes");
    const collection = database.collection("orders");
    const orders = await collection.find({}).toArray();  // استخدام find بدلاً من findOne للحصول على جميع المنتجات

    if (orders.length > 0) {
      res.json(orders);  // إرسال جميع المنتجات في الرد
    } else {
      res.status(404).send("No orders found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => console.log(`Listening to port ${port}`));