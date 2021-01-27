importClass(Packages.ij.IJ);

//---Abrir imagen y devolverla
function abrirImg(path){ 
    var img = IJ.openImage(path);
    img.show();
    return img;
}


//---Funcion recortadora a partir de una imagen y una coordenada
function extraer(img, coord){
    img.setRoi(coord.x - 4, coord.y - 4, coord.w, coord.h);
    img2 = img.resize(coord.w, coord.h, "bilinear");
    return img2;
}


//---Funcion que transforma la imagen en matriz de pixeles
function imgToArray(img){
    var arr = new Array();
    for(var h=0; h<img.getHeight(); h++){
        var row = new Array();
        for(var w=0; w<img.getWidth(); w++){
            row.push(pixelFactory(img.getPixel(w, h)));
        }
        arr.push(row);
    }
    return arr;
}


//---Funcion que calcula Rojo/Verde
function rSobreG(imgArr){
    var res = new Array();
    for(var h=0; h<imgArr.length; h++){
        var row = new Array();
        for(var w=0; w<imgArr[0].length; w++){
            row.push(imgArr[w][h].R / imgArr[w][h].G)
        }
        res.push(row);
    }
    return res;
}


//---Funcion que calcula el RO
function ro(imgArr){
    var res = new Array();
    for(var h=0; h<imgArr.length; h++){
        var row = new Array();
        for(var w=0; w<imgArr[0].length; w++){
            row.push(Math.sqrt((imgArr[w][h].R * imgArr[w][h].R) + (imgArr[w][h].G * imgArr[w][h].G) + (imgArr[w][h].B * imgArr[w][h].B)))
        }
        res.push(row);
    }
    return res;
}


//---Funcion que calcula el min, max y media del array
function calcMinMaxMed(imgArr, nroRecorte){
    var min, max;
    var sum = 0;
    var count = 0;

    for(var h=0; h<imgArr.length; h++){
        for(var w=0; w<imgArr[0].length; w++){
            count++;
            sum+= imgArr[w][h];
            if(min === undefined) min = imgArr[w][h];
            else if(min > imgArr[w][h]) min = imgArr[w][h];

            if(max === undefined) max = imgArr[w][h];
            else if(max < imgArr[w][h]) max = imgArr[w][h];
        }
    }
    return resumenFactory(nroRecorte, min, max, sum/count);
}


//---Funcion que calcula el min, max y media absoluta
function calcMinMaxMedAbsoluta(resumen){
    var min, max;
    var sum = 0;
    var count = 0;

    for(var i=0; i<resumen.length; i++){
        count++;
        sum+= resumen[i].media;
        if(min === undefined) min = resumen[i].minima;
        else if(min > resumen[i].minima) min = resumen[i].minima;

        if(max === undefined) max = resumen[i].maxima;
        else if(max < resumen[i].maxima) max = resumen[i].maxima;
    }
    return resumenFactory("Absoluta", min, max, sum/count);
}


//---Transforma el Resumen en table
function toTable(resumen, nombre){
    var tabla = new ResultsTable();

    var absoluta = calcMinMaxMedAbsoluta(resumen)
    tabla.addValue("Recorte Nro", absoluta.nro);
    tabla.addValue("Minima", absoluta.minima);
    tabla.addValue("Media", absoluta.media);
    tabla.addValue("Maxima", absoluta.maxima);

    for(var res in resumen){
        tabla.addRow();
        tabla.addValue("Recorte Nro", resumen[res].nro);
        tabla.addValue("Minima", resumen[res].minima);
        tabla.addValue("Media", resumen[res].media);
        tabla.addValue("Maxima", resumen[res].maxima);
    }
    tabla.show(nombre);
}


//---Funcion que calcula los datos del resumen
function resumir(img, i){
    var arr = imgToArray(img);

    var cosRes = rSobreG(arr);
    var resumenCos = calcMinMaxMed(cosRes, i);

    var roRes = ro(arr);
    var resumenRo = calcMinMaxMed(roRes, i);
    
    return [resumenCos, resumenRo];
}


//---Caja de dialogo para seleccionar el input
function seleccionarInputDir(){
    var gd = new NonBlockingGenericDialog("Selector"); 
    gd.addFileField("Seleccione la Imagen ", null)
    gd.addMessage("Esta debe ser la primera del directorio a recorrer")
    gd.hideCancelButton();
    gd.showDialog();

    var path = gd.getNextString()
    if(path) return abrirImg(path)
    return gd.getNextImage()
}


//---Constructor de Coordenadas
function coordFactory(){
    var obj = {};
    obj.x = 17;
    obj.y = 17;
    obj.w = 9;
    obj.h = 9;
    return obj;
}


//---Constructor de Pixel
function pixelFactory(pixel){
    var pix = {};
    pix.R = pixel[0];
    pix.G = pixel[1];
    pix.B = pixel[2];
    return pix;
}

//---Constructor de Resumen
function resumenFactory(i, min, max, med){
    var resumen = {};
    resumen.nro = i;
    resumen.minima = min;
    resumen.maxima = max;
    resumen.media = med;
    return resumen;
}


function main(){
    var img = seleccionarInputDir();
    var firstName = img.getTitle();

    var i = 0;

    var resumenesCos = new Array();
    var resumenesRo = new Array();

    do{
        var recorte = extraer(img, coordFactory());
        if(recorte){
            var resumenes = resumir(recorte, i);
            resumenesCos.push(resumenes[0]);
            resumenesRo.push(resumenes[1]);
        }

        IJ.run(img, "Open Next", "");
        i++;
    }while(firstName != img.getTitle())

    //--------- Recorrer directorio, recortar y resumir
    toTable(resumenesCos, "Red/Green");
    toTable(resumenesRo, "Ro");
}

main();