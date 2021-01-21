importClass(Packages.ij.IJ);

//---Abrir imagen y devolverla
function abrirImg(path){ 
    var img = IJ.openImage(path);
    img.show();
    return img;
}


//---Funcion recortadora a partir de una imagen y una coordenada
function extraer(img, coord){
    if((coord.x - 4 < 0) || 
        (coord.y - 4 < 0) || 
        (coord.x + 4 >= img.getWidth()) || 
        (coord.y + 4 >= img.getHeight())) return false;
    else{
        img.setRoi(coord.x - 4, coord.y - 4, coord.w, coord.h);
        img2 = img.resize(coord.w, coord.h, "bilinear");
        return img2;
    }
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


//---Funcion que calcula el coseno de Rojo/Verde
function cosRsobreG(imgArr){
    var res = new Array();
    for(var h=0; h<imgArr.length; h++){
        var row = new Array();
        for(var w=0; w<imgArr[0].length; w++){
            row.push(Math.cos(imgArr[w][h].R / imgArr[w][h].G))
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
            row.push(Math.sqrt(Math.pow(imgArr[w][h].R, 2) + Math.pow(imgArr[w][h].G, 2) + Math.pow(imgArr[w][h].B, 2)))
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


//---Transforma el Resumen en table
function toTable(resumen, nombre){
    var tabla = new ResultsTable();

    for(var res in resumen){
        if(res != 0) tabla.addRow();
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

    var cosRes = cosRsobreG(arr);
    var resumenCos = calcMinMaxMed(cosRes, i);

    var roRes = ro(arr);
    var resumenRo = calcMinMaxMed(roRes, i);
    
    return [resumenCos, resumenRo];
}


//---Caja de dialogo para seleccionar el input
function seleccionarImg(){
    var gd = new NonBlockingGenericDialog("Selector"); 

    try{ gd.addImageChoice("Seleccione la Imagen ", null) }
    catch(err){ gd.addFileField("O ", null) } 
    finally{ 
        gd.hideCancelButton();
        gd.showDialog();

        var path = gd.getNextString()
        if(path) return abrirImg(path)
        return gd.getNextImage()
    }
}


//---Funcion que espera a que el usuario realize una tarea
function esperar(cadena){
    var gd = new NonBlockingGenericDialog("");
    gd.addMessage(cadena);
    gd.hideCancelButton();
    gd.showDialog();
}


//---Constructor de Coordenadas
function coordFactory(xCenter, yCenter){
    var obj = {};
    obj.x = xCenter;
    obj.y = yCenter;
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
    var img = seleccionarImg();

    //--------- Obtener los puntos marcados o esperar a que sean marcados
    try{ 
        var points = img.getRoi().getContainedPoints(); 
        if(img.getRoi().getType() != 10) throw true;
    }
    catch(err){
        IJ.setTool("multipoint");
        esperar("Seleccione los puntos requeridos y luego presione OK");
    } 
    finally{ 
        var points = img.getRoi().getContainedPoints();
        if(img.getRoi().getType() != 10) throw "La seleccion debe ser de Puntos! no de Areas/Lineas!";
    }

    //--------- Crear vector de coordenadas 
    var arrCord = new Array(); 
    for(var i in points){ arrCord.push(coordFactory(points[i].x, points[i].y)) }

    //--------- Recorrer coordenadas, recortar y guardar
    var resumenesCos = new Array();
    var resumenesRo = new Array();

    for(var i in arrCord){
        var recorte = extraer(img, arrCord[i]);
        if(recorte){
            var resumenes = resumir(recorte, i);
            resumenesCos.push(resumenes[0]);
            resumenesRo.push(resumenes[1]);
        }
    }
    toTable(resumenesCos, "Coseno Red/Green");
    toTable(resumenesRo, "Ro");
}

main();