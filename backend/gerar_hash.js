import bcrypt from "bcrypt";

const senha = "123456"; // a senha que você quer usar pra logar

bcrypt.hash(senha, 10).then((hash) => {
    console.log("Senha:", senha);
    console.log("Hash gerado:", hash);
});