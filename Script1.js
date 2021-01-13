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


function operar(operando, operador, constante){
    //Plugins>Macros>Record para generar run()
    //["Add...", "Subtract...", "Gamma..."]
    IJ.run(operando, operador, "value="+constante);
}

function operar2(operador, operando1, operando2, create){
    //["Add", "Subtract", "Multiply", "Divide", "And", "Or", "Xor", "Min", "Max", "Average", "Diference", "Copy"];
    return ImageCalculator.run(operando1, operando2, operador+(create? " create":""));
}

function main(){
    var img = abrirImg("RGB.png");
    var canales = dividirCanales(img);
    for(x in canales){
        guardarImg(canales[x], canales[x].getTitle());
        //canales[x].close()
    }
    operar(canales[0], "Add...", 30);
    guardarImg(canales[0], "Red+30");
    operar(canales[1], "Subtract...", 15);
    guardarImg(canales[1], "Green-15");
    unirCanales(canales, true);

    img = WindowManager.getImage("RGB");
    guardarImg(img, "Procesada");

    canales[0].close();
    canales[1].close();
    canales[2].close();

    var img2 = abrirImg("RGB.png");
    operar(img2, "Gamma...", 0.50);
    guardarImg(img2, "MasGamma");

    var img3 = operar2("Add", img, img2, true);
    img3.show();
    guardarImg(img3, "Suma de Imagenes");

    img.close();
    img2.close();
    img3.close();

    /*while(img){
        //procesos...

        IJ.run(img, "Open Next", "");
    }
    img.close();*/
}

main();