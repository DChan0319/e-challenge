const directories = new Map();
const output = [];
const input = `
CREATE fruits
CREATE vegetables
CREATE grains
CREATE fruits/apples
CREATE fruits/apples/fuji
LIST
CREATE grains/squash
MOVE grains/squash vegetables
CREATE foods
MOVE grains foods
MOVE fruits foods
MOVE vegetables foods
LIST
DELETE fruits/apples
DELETE foods/fruits/apples
LIST
`;

const createDirectory = (fileStructure) => {
  const path = fileStructure.split('/');
  const fileOrDirectoryToCreate = path[path.length - 1];
  
  if (path.length === 1) {
    if (directories[fileOrDirectoryToCreate]) {
      output.push('Directory already exists! Please try again.');
      return;
    }

    directories.set(fileOrDirectoryToCreate, new Map());
  } else {
    const currDirectory = loopToDirectory(fileStructure, path.length - 1);

    if (currDirectory) {
      currDirectory.set(fileOrDirectoryToCreate, new Map());
    }
  }

  return;
};

const deleteFromDirectories = (fileStructure) => {
  const path = fileStructure.split('/');
  const fileOrDirectoryToDelete = path[path.length - 1];
  const currDirectory = loopToDirectory(fileStructure, path.length - 1);

  if (currDirectory) {
    currDirectory.delete(fileOrDirectoryToDelete);
  }

  return;
};

const listDirectories = (path, indentation) => {
  const entries = path.entries();
  let currDirectory = entries.next().value;
  let nextEntry = entries.next().value;

  while (currDirectory) {
    output.push(`${' '.repeat(indentation)}${currDirectory[0]}`);
    if (currDirectory[1].size > 0) {
      listDirectories(currDirectory[1], indentation + 2);
    }

    currDirectory = nextEntry;
    nextEntry = entries.next().value;
  }

  return;
};

const moveDirectoryTo = (filePath, destination) => {
  const path = filePath.split('/');
  const fileOrDirectoryToMove = path[path.length - 1];
  const currDirectory = loopToDirectory(filePath, path.length);
  const destinationDir = loopToDirectory(destination, destination.split('/').length);

  if (currDirectory && destinationDir) {
    destinationDir.set(fileOrDirectoryToMove, currDirectory);
    deleteFromDirectories(filePath);
  }

  return;
};

const loopToDirectory = (path, positionInPath) => {
  let destinationDir = directories;
  const destinationPath = path.split('/');
  for (let index = 0; index < positionInPath; index++) {
    if (!destinationDir.get(destinationPath[index])) {
      output.push(`Cannot find ${path} - ${destinationPath[index]} does not exist`);
      return;
    }

    destinationDir = destinationDir.get(destinationPath[index]);
  }

  return destinationDir;
};

const directoryCommands = (input) => {
  const commands = input.trim().split(/\n/);
  commands.forEach(command => {
    const splitStringInputs = command.split(' ');
    const commandKey = splitStringInputs[0];
    switch (commandKey) {
      case 'CREATE':
        output.push(command);
        createDirectory(splitStringInputs[1]);
        break;
      case 'MOVE':
        output.push(command);
        moveDirectoryTo(splitStringInputs[1], splitStringInputs[2]);
        break;
      case 'LIST':
        output.push(command);
        listDirectories(directories, 0);
        break;
      case 'DELETE':
        output.push(command);
        deleteFromDirectories(splitStringInputs[1]);
        break;
      default:
        output.push(`Your command: ${commandKey}, is not supported. Please try again (CREATE, MOVE, LIST, DELETE).`);
        break;
    }
  });

  return output.join('\n');
};

console.log(directoryCommands(input));
