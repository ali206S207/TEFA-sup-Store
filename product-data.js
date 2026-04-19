const WHATSAPP_NUMBER = "201228164202";

const categoryLabels = {
  mass: "تضخيم",
  cut: "تنشيف",
  health: "صحة",
  energy: "طاقة",
};

const stockLabels = {
  available: "متوفر",
  low: "قرب يخلص",
  preorder: "طلب مسبق",
  out: "غير متوفر",
};

const products = [
  {
    id: "crea-power",
    name: "Crea Power Creatine 250g",
    category: "mass",
    badge: "Power",
    stock: "available",
    price: 650,
    image: "assets/products/crea-power.png",
    flavors: ["بدون طعم"],
    description: "كرياتين مونوهيدرات 250 جم لدعم القوة وزيادة الأداء العضلي.",
    benefits: ["5g كرياتين في الجرعة", "يدعم القوة", "مناسب لكل أهداف التمرين"],
    usage: "3-5g يوميًا مع مياه أو مشروبك المفضل.",
  },
  {
    id: "organic-ashwagandha",
    name: "Organic Nation Ashwagandha 600",
    category: "health",
    badge: "Stress Support",
    stock: "available",
    price: 420,
    image: "assets/products/organic-ashwagandha.png",
    flavors: ["كبسولات"],
    description: "أشواجندا 600 من Organic Nation لدعم الاسترخاء والتوازن اليومي.",
    benefits: ["مضاد أكسدة", "دعم عام", "روتين يومي"],
    usage: "كبسولة يوميًا أو حسب إرشادات المنتج.",
  },
  {
    id: "one-raw",
    name: "ONE RAW 100 Serv",
    category: "energy",
    badge: "100 Serv",
    stock: "available",
    price: 950,
    image: "assets/products/one-raw.png",
    flavors: ["حسب المتاح"],
    description: "منتج أداء قبل التمرين بحجم 100 سيرف لدعم الطاقة والتركيز.",
    benefits: ["100 جرعة", "طاقة وتركيز", "مناسب قبل التمرين"],
    usage: "جرعة قبل التمرين بـ 20-30 دقيقة.",
  },
  {
    id: "organic-zinc",
    name: "Organic Nation Liposomal Zinc",
    category: "health",
    badge: "Zinc",
    stock: "available",
    price: 260,
    image: "assets/products/organic-zinc.png",
    flavors: ["أقراص"],
    description: "زنك ليبوسومال 30 قرص لدعم المناعة والصحة العامة.",
    benefits: ["30 قرص", "يدعم المناعة", "دعم يومي"],
    usage: "قرص يوميًا مع وجبة.",
  },
  {
    id: "azgard-isolate-raspberry",
    name: "Azgard 100% Whey Isolate Raspberry Yogurt",
    category: "mass",
    badge: "Isolate",
    stock: "available",
    price: 2850,
    image: "assets/products/azgard-isolate-raspberry.png",
    flavors: ["Raspberry Yogurt"],
    description: "واي بروتين آيزوليت 2270 جم بنكهة Raspberry Yogurt، عالي الجودة ومناسب للتنشيف والتضخيم النظيف.",
    benefits: ["28g بروتين", "Lactose Free", "Gluten Free"],
    usage: "جرعة بعد التمرين أو حسب احتياجك اليومي للبروتين.",
  },
  {
    id: "beta-alanine",
    name: "Beta Alanine 200g",
    category: "energy",
    badge: "Performance",
    stock: "available",
    price: 450,
    image: "assets/products/beta-alanine.png",
    flavors: ["بدون طعم"],
    description: "بيتا ألانين 200 جم لدعم التحمل والأداء في التمرين.",
    benefits: ["2g في الجرعة", "يدعم التحمل", "مناسب قبل التمرين"],
    usage: "2g يوميًا أو قبل التمرين حسب إرشادات المنتج.",
  },
  {
    id: "creatine-nano",
    name: "Azgard Creatine Nano 300g",
    category: "mass",
    badge: "Nano",
    stock: "available",
    price: 750,
    image: "assets/products/creatine-nano.png",
    flavors: ["بدون طعم"],
    description: "كرياتين نانو 300 جم، 100% كرياتين مونوهيدرات لزيادة القوة والأداء.",
    benefits: ["300g", "5g في الجرعة", "يدعم القوة"],
    usage: "3-5g يوميًا مع مياه.",
  },
  {
    id: "citrulline-malate",
    name: "L-Citrulline DL-Malate 150g",
    category: "energy",
    badge: "Pump",
    stock: "available",
    price: 520,
    image: "assets/products/citrulline-malate.png",
    flavors: ["Watermelon"],
    description: "سيترولين دي إل ماليت 150 جم بنكهة البطيخ لدعم الضخامة العضلية أثناء التمرين.",
    benefits: ["Pump أفضل", "يدعم الأداء", "نكهة Watermelon"],
    usage: "جرعة قبل التمرين بـ 20-30 دقيقة.",
  },
  {
    id: "perfect-omega-d3",
    name: "Organic Nation Perfect Omega D3",
    category: "health",
    badge: "Omega D3",
    stock: "available",
    price: 320,
    image: "assets/products/perfect-omega-d3.png",
    flavors: ["كبسولات"],
    description: "أوميجا مع فيتامين D3 لدعم صحة المفاصل والمناعة.",
    benefits: ["30 كبسولة", "دعم المناعة", "دعم المفاصل"],
    usage: "كبسولة يوميًا مع وجبة.",
  },
  {
    id: "azgard-isolate-choco-peanut",
    name: "Azgard 100% Whey Isolate Chocolate Peanut Butter",
    category: "mass",
    badge: "Isolate",
    stock: "available",
    price: 2850,
    image: "assets/products/azgard-isolate-choco-peanut.png",
    flavors: ["Chocolate Peanut Butter"],
    description: "واي بروتين آيزوليت 2270 جم بنكهة Chocolate Peanut Butter، بروتين عالي الجودة لاكتوز فري وجلوتين فري.",
    benefits: ["28g بروتين", "Lactose Free", "Gluten Free"],
    usage: "جرعة بعد التمرين أو حسب احتياجك اليومي للبروتين.",
  },
];

const bundles = [
  {
    id: "strength-pack",
    name: "باكدج القوة",
    description: "Creatine Nano + Beta Alanine + Citrulline لتمرين أقوى.",
    productIds: ["creatine-nano", "beta-alanine", "citrulline-malate"],
  },
  {
    id: "isolate-pack",
    name: "باكدج البروتين",
    description: "اختيارين Whey Isolate من Azgard للروتين البروتيني.",
    productIds: ["azgard-isolate-raspberry", "azgard-isolate-choco-peanut"],
  },
  {
    id: "health-pack",
    name: "باكدج الصحة اليومية",
    description: "Ashwagandha + Zinc + Omega D3 لدعم يومك.",
    productIds: ["organic-ashwagandha", "organic-zinc", "perfect-omega-d3"],
  },
];

function formatMoney(value) {
  return `${value.toLocaleString("ar-EG")} ج.م`;
}

function getProduct(id) {
  return products.find((item) => item.id === id);
}

function getDefaultFlavor(product) {
  return product?.flavors?.[0] || "عادي";
}

function getBundleTotal(bundle) {
  return bundle.productIds.reduce((sum, id) => sum + (getProduct(id)?.price || 0), 0);
}

function createOrderId() {
  const now = new Date();
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `TG-${stamp}-${random}`;
}

function readCart() {
  const raw = localStorage.getItem("tefaGymCart");
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter((line) => getProduct(line.id));

    return Object.entries(parsed)
      .map(([id, qty]) => {
        const product = getProduct(id);
        return product ? { id, flavor: getDefaultFlavor(product), qty } : null;
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

function writeCart(cart) {
  localStorage.setItem("tefaGymCart", JSON.stringify(cart));
}
