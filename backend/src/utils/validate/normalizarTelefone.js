export function normalizarTelefone(telefone) {
    let apenasDigitos = telefone.replace(/\D/g, "");

    // Remove um zero inicial de discagem antigo (ex: "021 99999-9999")
    if (apenasDigitos.length === 11 && apenasDigitos.startsWith("0")) {
        apenasDigitos = apenasDigitos.substring(1);
    }

    // Já tem DDI (12 = DDD+fixo, 13 = DDD+celular)
    if (apenasDigitos.length === 12 || apenasDigitos.length === 13) {
        return apenasDigitos;
    }

    // Só DDD + número (10 = fixo, 11 = celular) → adiciona DDI
    if (apenasDigitos.length === 10 || apenasDigitos.length === 11) {
        return `55${apenasDigitos}`;
    }

    // Não bate com nenhum formato válido de telefone BR
    return null;
}