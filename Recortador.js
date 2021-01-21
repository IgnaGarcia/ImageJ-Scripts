importClass(Packages.ij.IJ);

//---Abrir imagen y devolverla
function abrirImg(path){ 
    var img = IJ.openImage(path);
    img.show();
    return img;
}


//---Salvar la imagen en determinado directorio
function guardarImg(img, output, name){ IJ.saveAs(img, "Tiff", output+name) }


//---Funcion recortadora a partir de una imagen y una coordenada
function extraer(img, coord){
    if((coord.x - 15 < 0) || 
        (coord.y - 15 < 0) || 
        (coord.x + 15 >= img.getWidth()) || 
        (coord.y + 15 >= img.getHeight())) return false;
    else{
        img.setRoi(coord.x -15, coord.y - 15, coord.w, coord.h);
        img2 = img.resize(coord.w, coord.h, "bilinear");
        return img2;
    }
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


//---Funcion con plantilla de outputs
function definirOutput(){
    var gd = new GenericDialog("Selector");
    gd.addDirectoryField("Seleccione la Carpeta de Salidas", null);
    gd.addStringField("Seleccione el Nombre de los Archivos de Salida", "-salida");

    gd.showDialog();
    return [gd.getNextString(), gd.getNextString()];
}


//---Constructor de Coordenadas
function coordFactory(xCenter, yCenter){
    var obj = {};
    obj.x = xCenter;
    obj.y = yCenter;
    obj.w = 31;
    obj.h = 31;
    return obj;
}


function main(){
    var img = seleccionarImg();

    //--------- Obtener los puntos marcados o esperar a que sean marcados
    try{ var points = img.getRoi().getContainedPoints() }
    catch(err){
        IJ.setTool("multipoint");
        esperar("Seleccione los puntos requeridos y luego presione OK");
    } 
    finally{ var points = img.getRoi().getContainedPoints() }

    //--------- Crear vector de coordenadas 
    var arrCord = new Array(); 
    for(var i in points){ arrCord.push(coordFactory(points[i].x, points[i].y)) }

    //--------- Obtener direccion del output
    var outputsArr = definirOutput();
    var outputDir = outputsArr[0];
    var outputName = outputsArr[1];

    //--------- Recorrer coordenadas, recortar y guardar
    for(var i in arrCord){
        var img2 = extraer(img, arrCord[i]);
        if(img2){
            img2.show();
            guardarImg(img2, outputDir, i+outputName);
        }
    }
}

main();