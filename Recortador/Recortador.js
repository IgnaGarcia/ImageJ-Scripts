importClass(Packages.ij.IJ);

//---Abrir imagen y devolverla
function abrirImg(path){ 
    var img = IJ.openImage(path);
    img.show();
    return img;
}


//---Salvar la imagen en determinado directorio
function guardarImg(img, format, output, name){ IJ.saveAs(img, format, output+name) }


//---Funcion recortadora a partir de una imagen y una coordenada
function extraer(img, coord){
    if((coord.x - 16 < 0) || 
        (coord.y - 16 < 0) || 
        (coord.x + 16 >= img.getWidth()) || 
        (coord.y + 16 >= img.getHeight())) return false;
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
    gd.addStringField("Texto agregado a la salida", "salida");
    gd.addChoice("Seleccione el Formato de Salida",["Png", "Tiff", "Raw"], "");    

    gd.showDialog();
    return [gd.getNextString(), gd.getNextString(), gd.getNextChoice()];
}


//---Constructor de Coordenadas
function coordFactory(xCenter, yCenter){
    var obj = {};
    obj.x = xCenter;
    obj.y = yCenter;
    obj.w = 33;
    obj.h = 33;
    return obj;
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

    //--------- Obtener direccion del output
    var outputsArr = definirOutput();
    var outputDir = outputsArr[0];
    var outputName = img.getTitle().slice(0, -4)+"_"+outputsArr[1];
    var outputFormat = outputsArr[2];

    //--------- Recorrer coordenadas, recortar y guardar
    for(var i in arrCord){
        var img2 = extraer(img, arrCord[i]);
        if(img2){
            img2.show();
            guardarImg(img2, outputFormat, outputDir, outputName+"_"+i);
            img2.close();
        }
    }
}

main();