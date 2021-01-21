importClass(Packages.ij.IJ);

function abrirImg(name){
    //carpeta donde estan las imagenes a procesar
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

function coordFactory(x, y, w, h){
    var obj = {};
    obj.x = x;
    obj.y = y;
    obj.w = w;
    obj.h = h;
    return obj;
}

function main(){
    var inputImg = "RGB.png";
    var arrCord = [coordFactory(0, 0, 20, 20), 
        coordFactory(20, 0, 20, 20), 
        coordFactory(40, 0, 20, 20)];

    var outputName = "-test";

    var img = abrirImg(inputImg);

    for(var i in arrCord){
        var c = arrCord[i];
        var img2 = extraer(img, c.x, c.y, c.w, c.h);
        img2.show();
        guardarImg(img2, i+outputName);
    }
}

main();