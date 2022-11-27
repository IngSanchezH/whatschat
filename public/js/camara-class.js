class Camara{
    constructor(VideoNode){
        this.VideoNode = VideoNode;
        console.log('Camara inicializada');
    }

    encender(){
        navigator.mediaDevices.getUserMedia({
            audio:false,
            video:{width:300, height:300}
        }).then(stream=>{
            this.VideoNode.srcObject = stream;
            this.stream = stream;
        });
    }

    apagar(){
        this.VideoNode.pause();
        if(this.stream){
            this.stream.getTracks()[0].stop();
        }
    }

    tomarFoto(){

        //crear un elemento canvas
        let canvas = document.createElement('canvas');

        //colocar las dimenciones
        canvas.setAttribute('width', 300);
        canvas.setAttribute('height', 300);

        //obtener el contecto del cancas
        let context = canvas.getContext('2d'); //imagen simple

        //dibujar la imagen por dentro
        context.drawImage(this.VideoNode, 0, 0, canvas.width, canvas.height);

        this.foto = context.canvas.toDataURL();

        //limpieza
        canvas = null;
        context = null;

        return this.foto;
    }
}