import cloudinary from "../config/cloudinaryConfig.js";

export function uploadImagem(buffer, pasta) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: pasta,
                resource_type: "image"
            },
            (erro, resultado) => {
                if (erro) return reject(erro);
                resolve(resultado); // contém .secure_url e .public_id
            }
        );
        stream.end(buffer);
    });
}

export async function deletarImagem(public_id) {
    if (!public_id) return;
    try {
        await cloudinary.uploader.destroy(public_id);
    } catch (erro) {
        console.error("Erro ao deletar imagem antiga no Cloudinary:", erro.message);
    }
}