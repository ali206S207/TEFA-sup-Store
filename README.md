# TEFA GYM Supplements Store

موقع ثابت لمتجر مكملات رياضية باسم TEFA GYM.

## الملفات المهمة

- `index.html`: الصفحة الرئيسية والكتالوج.
- `product.html`: صفحة تفاصيل المنتج، تعمل عن طريق رابط مثل `product.html?id=whey-pro`.
- `checkout.html`: صفحة مراجعة السلة وإرسال الأوردر على واتساب.
- `product-data.js`: بيانات المنتجات، الأسعار، النكهات، المخزون، والباكدجات.
- `app.js`: منطق الصفحة الرئيسية والسلة.
- `product.js`: منطق صفحة تفاصيل المنتج.
- `checkout.js`: منطق صفحة الـ Checkout ورسالة واتساب.
- `styles.css`: كل التصميم والدارك مود.
- `assets/`: اللوجو وصور المنتجات الحالية.

## تعديل المنتجات

لما تكون الصور والأسعار النهائية جاهزة، عدل ملف:

```text
product-data.js
```

الأسعار الحالية مؤقتة لحين اعتماد الأسعار النهائية من صاحب الجيم.

كل منتج له الشكل ده:

```js
{
  id: "whey-pro",
  name: "TEFA Whey Pro 2kg",
  category: "mass",
  badge: "Best Seller",
  stock: "available",
  price: 1850,
  image: "assets/whey.svg",
  flavors: ["شوكولاتة", "فانيليا", "فراولة"],
  description: "وصف قصير يظهر في الكتالوج.",
  benefits: ["ميزة 1", "ميزة 2"],
  usage: "طريقة الاستخدام."
}
```

قيم المخزون المتاحة:

```text
available
low
out
```

## النشر على GitHub Pages

1. ارفع كل ملفات المشروع كما هي.
2. افتح إعدادات الريبو.
3. ادخل Pages.
4. اختار Branch: `main`.
5. اختار Folder: `/root`.
6. احفظ وانتظر لينك النشر.

لا تغير اسم `index.html` لأنه الملف الرئيسي الذي يفتحه GitHub Pages تلقائيًا.
