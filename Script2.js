importClass(Packages.ij.IJ);

function abrirImg(name){
    //carpeta donde estan las imagenes a procesar
    //getDir("Choose a Directory");
    var input = "C:/work/InvestigacionKIWI/imageJ/imagenes/";

    //abrir imagen
    var img = IJ.openImage(input+name);
    img.show();
    return img;
}


function guardarImg(img, name){
    //carpeta donde estan las imagenes procesadas
    var output = "C:/work/InvestigacionKIWI/imageJ/procesadas/";
    IJ.saveAs(img, "Tiff", output+name);
}


function extraer(img, fromX, fromY, width, height){
    img.setRoi(fromX, fromY, width, height);
    img2 = img.resize(width, height, "bilinear");
    return img2;
}


function main(){
    var img = abrirImg("RGB.png");

    var img2 = extraer(img, 0, 0, 300, 400);

    img2.show();

    guardarImg(img2, "prueba extraccion");
}

main();