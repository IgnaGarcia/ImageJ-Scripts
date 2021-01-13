importClass(Packages.ij.IJ);

/*

getImageInfo();
getInfo("image.titles");
getPixel(x, y);
getValue(x, y);
makePoint(x, y, options);
type 'hybrd', 'cross', 'dot' o 'circle'
color 'red', 'white', etc.
size 'tiny', 'small', 'medium', 'large' o 'extra large'
nImages();
nResults();
setLocation(x, y);
setColor(r,g,b||value||string);
setPixel(x, y, value);
updateDisplay();
value(x, y);
*/

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


function obtenerOperandos(cant){
    //cantidad de imagenes abiertas
    var ventanas = WindowManager.getIDList();

    //corroborar que los operandos esten abiertos
    if (null == ventanas || ventanas.length<cant){
        IJ.showMessage("Error", "No hay suficientes imagenes abiertas");
        return;
    }

    var titulos = new Array();
    //recorro las ventanas y si son imagenes las guardo
    for (var i=0, k=0; i<ventanas.length; i++) {
        var img = WindowManager.getImage(ventanas[i]);
        if (img) titulos[k++] = img.getTitle();
    }

    //caja de dialogo
    var gd = new GenericDialog("NOMBRE");
    gd.addMessage("Titulo");
    for(var i=0; i<cant; i++){
        gd.addChoice("image "+i, titulos, titulos[i]);
    }
    gd.addCheckbox("Create New Window", true);
    gd.showDialog(); //mostrar

    if (gd.wasCanceled()) return;

    var img1Index = gd.getNextChoiceIndex();
    var img2Index = gd.getNextChoiceIndex();
    var create_window = gd.getNextBoolean();

    return [WindowManager.getImage(ventanas[img1Index]),
            WindowManager.getImage(ventanas[img2Index]),
            create_window];
}


function operar(operando, operador, constante){
    //Plugins>Macros>Record para generar run()
    //["Add...", "Subtract...", "Gamma..."]
    IJ.run(operando, operador, "value="+constante);
}


function operar2(operador, operando1, operando2, create){
    //["Add", "Subtract", "Multiply", "Divide", "And", "Or", "Xor", "Min", "Max", "Average", "Diference", "Copy"];
    return ImageCalculator.run(operando1, operando2, operador+(create? " create":""));
}


function dividirCanales(img){
    WindowManager.setWindow(WindowManager.getWindow(img.getTitle()));
    IJ.run("Split Channels");
    var canales = [];

    //cambiar nombres
    canales[0] = WindowManager.getImage(img.getTitle()+" (red)");
    canales[0].setTitle("RED-"+img.getTitle());

    canales[1] = WindowManager.getImage(img.getTitle()+" (green)");
    canales[1].setTitle("GREEN-"+img.getTitle());

    canales[2] = WindowManager.getImage(img.getTitle()+" (blue)");
    canales[2].setTitle("BLUE-"+img.getTitle());

    return canales;
}


function unirCanales(canales, keep){
    IJ.run("Merge Channels...", "c1="+canales[0].getTitle()+" c2="+canales[1].getTitle()+" c3="+canales[2].getTitle()+(keep ? " keep" : ""));
}


function extraer(img, fromX, fromY, width, height){
    img.setRoi(fromX, fromY, width, height);
    img2 = img.resize(width, height, "bilinear");
    return img2;
}

function pruebas(){
    //abrir imagen
    var img = abrirImg("RGB.png");
    var img2 = abrirImg("RGB.png");
    var imgs = [];
    var operandos = 2;
    var data = obtenerOperandos(operandos);
    if (data) {
        for(var i=0; i<operandos; i++){
            imgs[i] = data[i];
        }
        createWindow = data[operandos];

        // mostrar
        IJ.log(imgs[0]); // primer imagen
        IJ.log(imgs[1]); // segunda imagen
        IJ.log(createWindow); 
    }
}
pruebas();