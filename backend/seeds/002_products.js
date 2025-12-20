import { productCodes } from '../utils/productCodes.js';

const products = [
  {
    title: 'The Dachshund',
    description: 'Give your pup plush, joint-friendly rest with The Dachshund Pet Mat — an orthopedic, med-care-grade mat designed for long naps and daily adventures. Its anti-slip backing keeps the mat steady at home and in the car; the anti-stain, odor-resistant surface wipes clean in seconds for truly hassle-free hygiene. Stylish, durable, and travel-ready — perfect for dachshund lovers who value both comfort and cleanliness.',
    category: 'dogs',
    imageFile: '1(1).jpeg'
  },
  {
    title: 'Wipe your Paws',
    description: 'Wipe your Paws is engineered for owners who want spotless convenience and premium comfort. Built with medical-grade disinfectability and orthopedic cushioning, it protects floors and car seats while remaining odor-free and anti-stain. The anti-slip base and wipe-clean surface make it the easiest mat to maintain — no washing required.',
    category: 'dogs',
    imageFile: '2(1).jpeg'
  },
  {
    title: 'Paws of Steel',
    description: 'Strong on protection, gentle on joints — Paws of Steel offers orthopedic support inside a rugged, aesthetic design. The mat is anti-stain and odor-resistant, disinfectable to med-care standards, and secured by an anti-slip underside for safe use on floors or car seats. Wipe it clean and it\'s ready to go — ideal for active dogs and busy owners.',
    category: 'dogs',
    imageFile: '3(1).jpeg'
  },
  {
    title: 'Woof Pet Mat',
    description: 'Modern comfort meets medical-grade hygiene in the Woof Pet Mat. Its orthopedic foam cushions pressure points, while the anti-stain, odor-resistant surface keeps living spaces fresh. The anti-slip backing locks the mat in place for home and car travel and cleaning is effortless — just wipe.',
    category: 'dogs',
    imageFile: '4(1).jpeg'
  },
  {
    title: 'The Peeking Tabby',
    description: 'Charming and comfortable, The Peeking Tabby offers med-care orthopedic support tailored for curious cats. The anti-slip base stops slipping on smooth floors, and the anti-stain, odor-resistant top is disinfectable and wipe-cleanable for instant freshness. A stylish, hygienic nap spot that\'s perfect for home or travel.',
    category: 'cats',
    imageFile: '5(1).jpeg'
  },
  {
    title: 'Hope You Like Dogs Matt',
    description: 'For dog lovers who demand both comfort and cleanliness: Hope You Like Dogs Matt features orthopedic cushioning, med-grade disinfectability, and an anti-stain finish. It\'s odor-resistant and quick to wipe clean, with anti-slip grip making it safe for any surface — including car seats during trips.',
    category: 'dogs',
    imageFile: '6(1).jpeg'
  },
  {
    title: 'Kitty Crew Comfort Matt',
    description: 'The Kitty Crew Comfort Matt is built for feline relaxation and owner convenience. With orthopedic support, anti-slip stability, and a hygienic, odor-resistant top, this mat resists stains and disinfects easily. Minimal upkeep — just wipe it down — makes it ideal for multi-cat households and travel.',
    category: 'cats',
    imageFile: '7(1).jpeg'
  },
  {
    title: 'PawBone Classic Matt',
    description: 'Classic design, modern performance — the PawBone Classic Matt blends orthopedic med-care comfort with a wipe-clean, anti-stain surface. Odor-resistant and easy to disinfect, it protects floors and car seats while the anti-slip backing keeps pets secure. Stylish, sturdy, and low-maintenance.',
    category: 'dogs',
    imageFile: '8(1).jpeg'
  },
  {
    title: 'Big Paws Matt',
    description: 'Give big comfort to big paws with the Big Paws Matt. This mat\'s orthopedic layer supports joints, while its anti-stain, odor-resistant surface stays hygienic after a quick wipe. The anti-slip bottom makes it safe for home and vehicle use — perfect for larger breeds who need serious support.',
    category: 'dogs',
    imageFile: '9(1).jpeg'
  },
  {
    title: 'Scooby-Doo Classic',
    description: 'Nostalgic charm meets premium hygiene in Scooby-Doo Classic. Orthopedic support soothes joints as the anti-stain and odor-resistant coating keeps the mat smelling fresh. Secure anti-slip backing and wipe-clean convenience make it a practical, travel-ready favorite.',
    category: 'dogs',
    imageFile: '10(1).jpeg'
  },
  {
    title: 'Triple Whisker Blue',
    description: 'The Triple Whisker Blue mat is a stylish, med-care-standard resting surface with orthopedic cushioning for ongoing joint comfort. Its anti-stain and odor-resistant barrier is easy to disinfect — just wipe clean — while the anti-slip base ensures stability on any surface, including car seats.',
    category: 'cats',
    imageFile: '11-blue(1).jpeg'
  },
  {
    title: 'Triple Whisker White',
    description: 'Bright, minimal, and hygienic — Triple Whisker White offers med-grade disinfectability with orthopedic comfort. The anti-stain surface resists odors and wipes clean quickly, and the anti-slip backing keeps pets steady indoors and on the road. Elegant, practical, and low-effort to maintain.',
    category: 'cats',
    imageFile: '13(1).jpeg' // Swapped with Cosmic Kitty
  },
  {
    title: 'Cosmic Kitty',
    description: 'Add a touch of wonder to naps with Cosmic Kitty, a feline mat designed for comfort and cleanliness. Medical-grade disinfectability and orthopedic support keep cats healthy; the anti-stain, odor-resistant surface wipes clean instantly. Anti-slip grip makes it safe for smooth floors and travel crates.',
    category: 'cats',
    imageFile: '12(1).jpeg' // Swapped with Triple Whisker White
  },
  {
    title: 'Puppy Face Grid',
    description: 'Sweet, modern & supremely comfortable — Puppy Face Grid provides orthopedic cushioning and med-grade hygiene for playful pups. The anti-stain, odor-resistant top cleans with a single wipe, and the anti-slip underside secures the mat in cars and at home. Cute design, serious protection.',
    category: 'dogs',
    imageFile: '14(1).jpeg'
  },
  {
    title: 'PawPals Pattern Matt',
    description: 'The PawPals Pattern Matt balances whimsical design with medical-grade practicality. Orthopedic foam supports joint health while an anti-stain, odor-resistant surface keeps things fresh and hygienic. Anti-slip backing ensures stability on any floor or seat — perfect for everyday use and travel.',
    category: 'dogs',
    imageFile: '16(1).jpeg' // Swapped with PawPrint Fiesta
  },
  {
    title: 'PawPrint Fiesta Matt',
    description: 'Celebrate comfort with PawPrint Fiesta Matt, a festive design with med-care comfort and hygiene at its core. Anti-stain and odor-resistant, the mat disinfects quickly and wipes clean for instant freshness. Its anti-slip base secures it during playtime or car rides.',
    category: 'dogs',
    imageFile: '15(1).jpeg' // Swapped with PawPals
  },
  {
    title: 'MultiPaw Magic Matt',
    description: 'Versatile and vibrant — MultiPaw Magic Matt is built for pets who love lounging anywhere. Orthopedic support reduces pressure on joints; the anti-stain, odor-resistant surface resists soils and disinfects easily. Anti-slip backing makes it car- and home-safe, while wipe-clean maintenance keeps life simple.',
    category: 'dogs',
    imageFile: '17(1).jpeg'
  },
  {
    title: 'Guardian Paws Matt',
    description: 'Engineered for protection, Guardian Paws Matt combines med-grade disinfectability with robust orthopedic support. The anti-stain, odor-resistant finish wipes clean and the anti-slip underside keeps pets secure across surfaces. Ideal for owners who want maximum hygiene and safety.',
    category: 'dogs',
    imageFile: '18(1).jpeg'
  },
  {
    title: 'Paw Petrol Squad',
    description: 'Bold and dependable, Paw Petrol Squad is a travel-ready mat with med-care comfort and hygiene. Its orthopedic cushioning soothes joints while the anti-stain, odor-resistant surface stays fresh after a wipe. Anti-slip backing locks it in place on car seats or floors for safe, stylish travel.',
    category: 'dogs',
    imageFile: '2(1).jpeg' // Using available image
  },
  {
    title: 'Paw Matt',
    description: 'Simple, classic, and supremely practical — Paw Matt delivers med-care orthopedic support and effortless hygiene. The anti-stain, odor-resistant surface disinfects easily and requires only wiping; the anti-slip base ensures safety on all surfaces, making it a universal go-to for home and travel.',
    category: 'dogs',
    imageFile: '3(1).jpeg' // Using available image
  }
];

const variants = [
  { size: 'small', price: 3000, dimensions: '20*16 inches', stock: 50 },
  { size: 'medium', price: 4500, dimensions: '23*23 inches', stock: 50 },
  { size: 'large', price: 5000, dimensions: '20*35 inches', stock: 50 }
];

export async function seed(knex) {
  // Insert products
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const slug = product.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const sku = `PAW-${String(i + 1).padStart(3, '0')}`;
    
    const [insertedProduct] = await knex('products')
      .insert({
        title: product.title,
        slug: `${slug}-${i + 1}`,
        sku,
        description: product.description,
        price_pkr: variants[0].price, // Use small price as base
        category: product.category,
        stock: 0, // Stock is managed per variant
        is_active: true
      })
      .returning('*');
    
    // Insert variants with product codes
    for (const variant of variants) {
      const productCode = productCodes[product.title]?.[variant.size] || null;
      await knex('product_variants').insert({
        product_id: insertedProduct.id,
        size: variant.size,
        price_pkr: variant.price,
        stock: variant.stock,
        dimensions: variant.dimensions,
        product_code: productCode
      });
    }
    
    // Insert product images from public/images folder
    // Use the image file specified for this product
    const imageFileName = product.imageFile;
    
    // Insert multiple image sizes pointing to the public folder
    // The frontend will serve these from /images/ endpoint
    await knex('product_images').insert([
      {
        product_id: insertedProduct.id,
        url: `images/${imageFileName}`, // Path relative to public folder
        size_label: 'thumbnail'
      },
      {
        product_id: insertedProduct.id,
        url: `images/${imageFileName}`,
        size_label: 'small'
      },
      {
        product_id: insertedProduct.id,
        url: `images/${imageFileName}`,
        size_label: 'medium'
      },
      {
        product_id: insertedProduct.id,
        url: `images/${imageFileName}`,
        size_label: 'large'
      }
    ]);
  }
}

