function getImage(){
    var ventanas = WindowManager.getIDList();
    var imagenes = new Array();

    for (var i=0, k=0; i<ventanas.length; i++) {
        var img = WindowManager.getImage(ventanas[i]);
        if (img) imagenes[k++] = img;
    }

    return imagenes[0]
}

function main(){
    IJ.run("Recortador", "");
    var img = getImage();
    var firstName = img.getTitle();

    IJ.run(img, "Open Next", "");

    while(firstName != img.getTitle()){
        IJ.run("Recortador", "");
        IJ.run(img, "Open Next", "");
    }

    img.close()
    IJ.run("Summarizer", "");
}

main();