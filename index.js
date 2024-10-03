let cont = 0;

function crea_matriz(filas, columnas) {
    matriz = new Array(filas);
    for (let i = 0; i < filas; i++) {
        matriz[i] = new Array(columnas);
        for (let j = 0; j < columnas; j++) {
            matriz[i][j] = 0;
        }
    }
}

function generaMatrizInputs() {
    let columnas = parseInt(document.getElementById('nd').value);
    let filas = parseInt(document.getElementById('nr').value);
    let fo = '', aux = '', matriz = '', ceros = '';

    // Generar la función objetivo
    for (let i = 1; i <= columnas; i++) {
        fo += `<input type="text" value="0" name="X${i}" id="X${i}" onClick="this.select();" required="required" style="text-align:right;" /> X${i}`;
        ceros += `X${i}`;
        if (i != columnas) {
            fo += ' + ';
            ceros += ', ';
        }
    }
    document.getElementById('fo').innerHTML = `<p>Funcion Objetivo:</p>${fo}`;

    // Generar las restricciones
    for (let i = 1; i <= filas; i++) {
        for (let j = 1; j <= columnas; j++) {
            aux += `<input type="text" value="0" name="${i}X${j}" id="${i}X${j}" onClick="this.select();" required="required" style="text-align:right;" /> X${j}`;
            if (j != columnas) {
                aux += ' + ';
            }
        }
        matriz += `${aux} ≤  <input type="text" value="0" name="R${i}" id="R${i}" onClick="this.select();" required="required"  /><br /><br />`;
        aux = '';
    }
    document.getElementById('matriz').innerHTML = `<p>Restricciones:</p>${matriz}`;

    ceros += ' ≥ 0';
    document.getElementById('ceros').innerHTML = `${ceros}<p><input type="button" value="Resolver" id="btIterar" onClick="iterar()" /></p><hr />`;
    document.getElementById('nd').readOnly = true;
    document.getElementById('nr').readOnly = true;
}

function genera_matriz() {
    let variables = parseInt(document.getElementById('nd').value);
    let restricciones = parseInt(document.getElementById('nr').value);
    crea_matriz(restricciones + 2, variables + restricciones + 2);

    matriz[0][0] = 'Z';
    matriz[restricciones + 1][0] = 1;
    matriz[0][variables + restricciones + 1] = 'Sol';

    for (let i = 1; i <= variables; i++) {
        matriz[0][i] = 'X' + i;
    }

    for (let i = 1; i <= restricciones; i++) {
        matriz[0][i + variables] = 'S' + i;
    }

    for (let i = 1; i <= restricciones; i++) {
        for (let j = 1; j <= variables; j++) {
            matriz[i][j] = document.getElementById(i + 'X' + j).value;
        }
        matriz[i][variables + restricciones + 1] = document.getElementById('R' + i).value;

        for (let j = 1; j <= restricciones; j++) {
            matriz[i][i + variables] = 1;
        }
    }

    for (let j = 1; j <= variables; j++) {
        matriz[restricciones + 1][j] = document.getElementById('X' + j).value * (-1);
    }

    imprime_tabla();
}

function imprime_tabla() {
    let variables = parseInt(document.getElementById('nd').value);
    let restricciones = parseInt(document.getElementById('nr').value);
    let filas = restricciones + 2;
    let columnas = variables + restricciones + 2;
    let tabla = `<p>Tabla ${cont}:</p><table style="text-align:center; border-color:#CCC;" border="1" cellspacing="0" cellpadding="0">`;

    for (let i = 0; i < filas; i++) {
        tabla += '<tr>';
        for (let j = 0; j < columnas; j++) {
            tabla += `<td>${matriz[i][j]}</td>`;
        }
        tabla += '</tr>';
    }
    tabla += '</table>';
    document.getElementById('tabla').innerHTML += tabla;
    cont++;
}

function esFin() {
    let objetivo = document.getElementById('objetivo').value;
    let variables = parseInt(document.getElementById('nd').value);
    let restricciones = parseInt(document.getElementById('nr').value);

    if (objetivo == 'max') {
        for (let j = 1; j <= variables; j++) {
            if (matriz[restricciones + 1][j] < 0) return false;
        }
    } else if (objetivo == 'min') {
        for (let j = 1; j <= variables; j++) {
            if (matriz[restricciones + 1][j] > 0) return false;
        }
    }

    return true;
}

function encuentraPivoteJ() {
    let objetivo = document.getElementById('objetivo').value;
    let variables = parseInt(document.getElementById('nd').value);
    let restricciones = parseInt(document.getElementById('nr').value);
    let itemFila = matriz[restricciones + 1][1];
    pivoteJ = 1;

    if (objetivo == 'max') {
        for (let j = 1; j <= variables; j++) {
            if (matriz[restricciones + 1][j] < itemFila && matriz[restricciones + 1][j] != 0) {
                itemFila = matriz[restricciones + 1][j];
                pivoteJ = j;
            }
        }
    } else if (objetivo == 'min') {
        for (let j = 1; j <= variables; j++) {
            if (matriz[restricciones + 1][j] > itemFila && matriz[restricciones + 1][j] != 0) {
                itemFila = matriz[restricciones + 1][j];
                pivoteJ = j;
            }
        }
    }
}

function encuentraPivoteI() {
    let restricciones = parseInt(document.getElementById('nr').value);
    let variables = parseInt(document.getElementById('nd').value);
    let razon = 0;
    let aux = Number.MAX_VALUE;
    pivoteI = 0;

    for (let i = 1; i <= restricciones; i++) {
        razon = parseFloat(matriz[i][restricciones + variables + 1] / matriz[i][pivoteJ]);
        if (razon > 0 && razon < aux) {
            aux = razon;
            pivoteI = i;
        }
    }
}

function divideFila(i, n) {
    let variables = parseInt(document.getElementById('nd').value);
    let restricciones = parseInt(document.getElementById('nr').value);
    let ncolumnas = variables + restricciones + 2;

    for (let j = 0; j < ncolumnas; j++) {
        matriz[i][j] = parseFloat(matriz[i][j]) / n;
    }
}

function iterar() {
    document.getElementById('btIterar').disabled = true;
    genera_matriz();

    let variables = parseInt(document.getElementById('nd').value);
    let restricciones = parseInt(document.getElementById('nr').value);
    let ncolumnas = variables + restricciones + 2;
    let itemAux = 0;
    let respuesta = '<p>Solución: </p>';

    while (!esFin()) {
        encuentraPivoteJ();
        encuentraPivoteI();
        divideFila(pivoteI, matriz[pivoteI][pivoteJ]);

        for (let i = 1; i <= (restricciones + 1); i++) {
            itemAux = matriz[i][pivoteJ];
            for (let j = 0; j < ncolumnas; j++) {
                if (i != pivoteI) {
                    matriz[i][j] = matriz[i][j] - (itemAux * matriz[pivoteI][j]);
                }
            }
        }

        imprime_tabla();
    }

    for (let j = 1; j <= variables; j++) {
        for (let i = 1; i <= restricciones; i++) {
            if (matriz[i][j] == 1) {
                respuesta += `${matriz[0][j]} = ${matriz[i][variables + restricciones + 1]} <br />`;
            }
        }
    }

    respuesta += `Z = ${matriz[restricciones + 1][variables + restricciones + 1]}`;
    document.getElementById('tabla').innerHTML += respuesta + '<p>Fin del método</p>';
}
