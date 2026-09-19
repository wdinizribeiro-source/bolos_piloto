import multer from "multer";

const storage = multer.memoryStorage();

const filtroArquivo = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Arquivo precisa ser uma imagem."), false);
    }
};

const upload = multer({
    storage,
    fileFilter: filtroArquivo,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

export default upload;