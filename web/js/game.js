var matrix = [];
var moves = 0;
var maxLives = 0;
var currentLives = 0;
var subimages = [];
var firstPiece = null;
var selectedImage = ""; // Variable pour stocker le chemin de l'image sélectionnée



//mifidy oe iza amin'ilay sary no apiasaina
function selectImage(imagePath) {
    // Supprimer la classe 'selected' de l'image précédemment sélectionnée
    var previousSelectedImage = document.querySelector('.selected');
    if (previousSelectedImage) {
        previousSelectedImage.classList.remove('selected');
    }

    // Mettre à jour la nouvelle image sélectionnée
    selectedImage = imagePath;
    var selectedImageElement = document.querySelector(`img[src="${selectedImage}"]`);
    selectedImageElement.classList.add('selected'); // Ajouter la classe 'selected' à l'image sélectionnée
}



//mamorona matrice
function generateMatrix() {
    var rows = parseInt(document.getElementById("inputRows").value);
    var cols = parseInt(document.getElementById("inputCols").value);

    moves = 0;
    maxLives = rows * cols;
    currentLives = maxLives;

    var puzzleCanvas = document.getElementById("puzzleImage");
    var ctx = puzzleCanvas.getContext("2d");

    var img = new Image();
    img.src = selectedImage; // Utiliser l'image sélectionnée

    img.onload = function() {
        ctx.drawImage(img, 0, 0, puzzleCanvas.width, puzzleCanvas.height);

        subimages = cutImage(img, rows, cols);

        matrix = generateMatrixArray(rows, cols);
        matrix = shuffleMatrix(matrix);

        displayMatrixWithImages(matrix, subimages);

        document.getElementById("gameInfo").style.display = "block";
        updateGameInfo();
        
        // Afficher le bouton "Redistribuer"
        document.getElementById("redistributeButton").style.display = "block";
    };
}


//manapaka ilay sary
function cutImage(img, rows, cols) {
    var subimages = [];
    var imgWidth = img.width;
    var imgHeight = img.height;
    var subWidth = Math.floor(imgWidth / cols);
    var subHeight = Math.floor(imgHeight / rows);

    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            var startX = j * subWidth;
            var startY = i * subHeight;
            var subImg = document.createElement("canvas");
            subImg.width = subWidth;
            subImg.height = subHeight;
            subImg.getContext("2d").drawImage(img, -startX, -startY);
            subimages.push(subImg.toDataURL());
        }
    }

    return subimages;
}


//mamoka ilay matrice miaraka amin'ilay sary
function displayMatrixWithImages(matrix, subimages) {
    var outputDiv = document.getElementById("matrixOutput");
    outputDiv.innerHTML = "";

    var table = document.createElement("table");
    table.id = "matrixTable";

    for (var i = 0; i < matrix.length; i++) {
        var row = table.insertRow();
        for (var j = 0; j < matrix[i].length; j++) {
            var cell = row.insertCell();
            var imageWrapper = document.createElement("div");
            imageWrapper.className = "imageWrapper";
            var image = document.createElement("img");
            image.src = subimages[matrix[i][j] - 1];
            image.dataset.row = i; // Stocker la ligne de la pièce
            image.dataset.col = j; // Stocker la colonne de la pièce
            image.onclick = handleClick; // Ajouter un gestionnaire d'événements de clic
            var matrixOverlay = document.createElement("span");
            matrixOverlay.className = "matrixOverlay";
            matrixOverlay.textContent = matrix[i][j];
            imageWrapper.appendChild(image);
            imageWrapper.appendChild(matrixOverlay);
            cell.appendChild(imageWrapper);
        }
    }

    outputDiv.appendChild(table);
}

//mcliquer amin'ilay mapifamadika pieces
function handleClick(event) {
    // Vérifier si le jeu est déjà terminé
    if (isGameFinished()) {
        return; // Ne pas exécuter le reste de la fonction si le jeu est terminé
    }

    var clickedPiece = event.target;
    if (firstPiece === null) {
        // Si c'est la première pièce cliquée, la stocker et ajouter la classe d'accentuation à l'image
        firstPiece = clickedPiece;
        firstPiece.classList.add("selected");
        movesMade = true; // Définir à true car un coup a été effectué
    } else {
        // Échanger les pièces
        swapPieces(firstPiece, clickedPiece);
        // Réinitialiser la variable temporaire et supprimer la classe d'accentuation de l'image précédemment sélectionnée
        firstPiece.classList.remove("selected");
        firstPiece = null;
        // Masquer le bouton "Redistribuer"
        document.getElementById("redistributeButton").style.display = "none";
    }
    // Vérifier si un coup a été effectué pour afficher ou masquer le bouton "Redistribuer"
    var redistributeButton = document.getElementById("redistributeButton");
    redistributeButton.style.display = movesMade ? "none" : "block";
}

// Fonction pour vérifier si le jeu est terminé (gagné ou perdu)
function isGameFinished() {
    return isMatrixInOrder() || currentLives === 0;
}



//mapifamadika pieces
function swapPieces(piece1, piece2) {
    // Récupérer les positions des deux pièces
    var row1 = parseInt(piece1.dataset.row);
    var col1 = parseInt(piece1.dataset.col);
    var row2 = parseInt(piece2.dataset.row);
    var col2 = parseInt(piece2.dataset.col);

    // Échanger les numéros dans la matrice
    var temp = matrix[row1][col1];
    matrix[row1][col1] = matrix[row2][col2];
    matrix[row2][col2] = temp;

    // Mettre à jour le nombre de coups
    moves++;

    // Vérifier si la matrice est en ordre
    if (isMatrixInOrder()) {
        // Si la matrice est en ordre, ne pas décrémenter le nombre de vies
    } else {
        // Si la matrice n'est pas en ordre, décrémenter le nombre de vies
        currentLives--;
    }

    // Mettre à jour l'affichage
    displayMatrixWithImages(matrix, subimages);
    updateRotationButtonsVisibility();
    updateGameInfo();
}

//migenerer matrice
function generateMatrixArray(rows, cols) {
    var matrix = [];
    var counter = 1;

    for (var i = 0; i < rows; i++) {
        matrix[i] = [];
        for (var j = 0; j < cols; j++) {
            matrix[i][j] = counter++;
        }
    }

    return matrix;
}


//manaparitaka ny element an'ilay matrice
function shuffleMatrix(matrix) {
    var flattenedMatrix = matrix.flat();
    for (var i = flattenedMatrix.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        [flattenedMatrix[i], flattenedMatrix[j]] = [flattenedMatrix[j], flattenedMatrix[i]];
    }

    var shuffledMatrix = [];
    while (flattenedMatrix.length) {
        shuffledMatrix.push(flattenedMatrix.splice(0, matrix[0].length));
    }

    return shuffledMatrix;
}

//miverifier raha milahatra ilay matrice
function isMatrixInOrder() {
    var counter = 1;
    for (var i = 0; i < matrix.length; i++) {
        for (var j = 0; j < matrix[i].length; j++) {
            if (matrix[i][j] !== counter++) {
                return false;
            }
        }
    }
    return true;
}

//tsy afaka miclique intsony
function disableSwapSection() {
    document.getElementById("swapSection").style.pointerEvents = "none";
}

//miactualiser stat anle jeu
function updateGameInfo() {
    document.getElementById("moveCount").textContent = moves;
    document.getElementById("lifeCount").textContent = currentLives;

    if (isMatrixInOrder()) {
        document.getElementById("gameResult").textContent = "Vous avez gagné!";
        document.getElementById("gameResult").style.color = "green";
        disableSwapSection();
    } else if (currentLives === 0) {
        if (!isMatrixInOrder) {
            document.getElementById("gameResult").textContent = "Vous avez gagné!";
            document.getElementById("gameResult").style.color = "green";
            disableSwapSection();
        } else {
            document.getElementById("gameResult").textContent = "Vous avez perdu.";
            document.getElementById("gameResult").style.color = "red";
            disableSwapSection();
        }
    }
}


//tsy afapo ka averina aparitaka tsotra n sary
function redistributeImages() {
    matrix = shuffleMatrix(matrix); // Mélanger la matrice
    displayMatrixWithImages(matrix, subimages); // Afficher la matrice mise à jour
}


//rotation ny element an'ilay matrice
function rotateMatrix(degrees) {
    var rotatedMatrix = [];
    var rows = matrix.length;
    var cols = matrix[0].length;

    // Convertir l'angle en un angle équivalent entre 0 et 360 degrés
    var normalizedDegrees = (degrees % 360 + 360) % 360;

    // Effectuer la rotation en fonction de l'angle spécifié
    switch (normalizedDegrees) {
        case 90:
            for (var i = 0; i < cols; i++) {
                rotatedMatrix.push([]);
                for (var j = 0; j < rows; j++) {
                    rotatedMatrix[i].push(matrix[rows - j - 1][i]);
                }
            }
            break;
        case 180:
            for (var i = rows - 1; i >= 0; i--) {
                rotatedMatrix.push([]);
                for (var j = cols - 1; j >= 0; j--) {
                    rotatedMatrix[rows - 1 - i].push(matrix[i][cols - 1 - j]);
                }
            }
            break;
        case 270:
            for (var i = cols - 1; i >= 0; i--) {
                rotatedMatrix.push([]);
                for (var j = rows - 1; j >= 0; j--) {
                    rotatedMatrix[cols - 1 - i].push(matrix[j][i]);
                }
            }
            break;
        default:
            // Si l'angle n'est pas un multiple de 90 degrés, ne rien faire
            return;
    }

    // Mettre à jour la matrice principale
    matrix = rotatedMatrix;

    // Mettre à jour l'affichage
    displayMatrixWithImages(matrix, subimages);
}

//tsoaana n bouton rotation en degré rehefa navita mouvement iray 
function updateRotationButtonsVisibility() {
    var rotationButtons = document.querySelectorAll('.rotation-button');

    // Si des mouvements ont déjà été effectués, masquez les boutons de rotation
    if (moves > 0) {
        rotationButtons.forEach(function(button) {
            button.style.display = 'none';
        });
    } else {
        rotationButtons.forEach(function(button) {
            button.style.display = 'inline-block';
        });
    }
}
