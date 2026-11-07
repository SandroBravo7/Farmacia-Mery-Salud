// Fotos de referencia para los productos iniciales con imágenes genéricas.
const meryCatalogPhotos = {
  1: 'paracetamol-500mg.png', // https://production-media.fahorro.com/media/catalog/product/7/5/7502223709225_1.png?bg-color=255%2C255%2C255&canvas=265%3A265&fit=bounds&format=jpeg&height=265&optimize=medium&width=265
  2: 'amoxicilina-500mg.jpg', // https://sanorim.mx/cdn/shop/files/Amoxicilina500mg.jpg?height=645&pad_color=fff&v=1683561681&width=645
  3: 'vitamina-c-zinc.jpg', // https://sanorim.mx/cdn/shop/files/Oxital_ZN.jpg?height=940&v=1743603307
  4: 'alcohol-gel-70-500ml.jpg', // https://force.pe/producto/alcohol-gel-70-de-500-ml-alkofarma/
  5: 'alcohol-medicinal-70-250ml.jpg', // https://dcuk1cxrnzjkh.cloudfront.net/imagesproducto/017208M.jpg
  6: 'gasas-esteriles-10.webp', // https://farmaciamoreira.com.ar/productos/gasana-gasa-no-tejida-esteril-10x10-cm-n5-10-compresas/
  7: 'protector-solar-spf50.jpg', // https://f.fcdn.app/imgs/10cd4d/www.farmacenter.com.py/farmpy/21cc/original/catalogo/10013485_10013485_1/2000-2000/dermaglos-solar-fps-50-emuls-pomo-x-50-unica.jpg
  8: 'multivitaminico-30.png', // https://farmacenter.com.pe/product/centrum-adulto-frasco-x-30-unid/
  1001: 'termometro-digital.jpg', // https://fsa.bo/productos/17072-01.jpg
  1002: 'mascarillas-50.jpg', // https://promart.vteximg.com.br/arquivos/ids/5914534/imageUrl_2.jpg?v=637902129488530000
  1003: 'venda-elastica.jpg', // https://e-comm-pub-prod.s3.amazonaws.com/img-comp/7503014279378_01.jpg
  1004: 'algodon-hidrofilo.jpg', // https://farmaciaslider.pe/my-assets/image/product/dddfcc9270978c4d48dd340363b07e8b.jpg
  1005: 'apositos-adhesivos.jpg', // https://clarel.imgix.net/media/catalog/product/2/8/286635_01_9401.jpg
  1006: 'gel-antibacterial-250ml.png', // https://medsupplybajio.com/productos/gel-antiseptico-protec-lima-limon-250ml
  1007: 'jabon-liquido-neutro.jpg', // https://production-media.fahorro.com/media/catalog/product/7/5/7506425609468.jpg
  1008: 'cepillo-dental-suave.jpg', // https://f.fcdn.app/imgs/3d39c9/www.farmaciagoes.com.uy/farguy/9051/original/catalogo/8427426006461_8427426006461_1/1500-1500/cepillo-de-dientes-suave-vitis-1-unidad-cepillo-de-dientes-suave-vitis-1-unidad.jpg
  1009: 'pasta-dental-90g.jpg', // https://production-media.fahorro.com/media/catalog/product/7/8/7896009419324.1.jpg?bg-color=255%2C255%2C255&canvas=372%3A465&fit=bounds&height=465&optimize=medium&width=372
  1010: 'panales-adulto-m.jpg', // https://walmartsv.vtexassets.com/arquivos/ids/750415/89008_01.jpg?v=638851644013200000
  1011: 'bebida-nutricional-vainilla.png', // https://farmaciasgi.com.mx/wp-content/uploads/2023/04/509594_Boost-Original-Sabor-Vainilla-237-ml.png
  1012: 'barras-avena-frutos-secos.webp', // https://www.naturevalley.com/products/trail-mix-fruit-nut-bars
};

window.getMeryProductImage = (product) => {
  const photo = meryCatalogPhotos[product.id];
  if (photo && product.imagenUrl?.startsWith('https://images.unsplash.com/')) {
    return `assets/img/products/${photo}`;
  }
  return product.imagenUrl;
};
