import fs from "fs-extra";

export const getAllFileNames = (sourceDir, targetDir, arrayOfFiles) => {
  const files = fs.readdirSync(sourceDir);

  let _arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (fs.statSync(sourceDir + "/" + file).isDirectory()) {
      _arrayOfFiles = getAllFileNames(
        sourceDir + "/" + file,
        targetDir + "/" + file,
        _arrayOfFiles
      );
    } else {
      _arrayOfFiles.push({
        fileName: file,
        sourceDir: sourceDir,
        targetDir: targetDir,
      });
    }
  });
  return _arrayOfFiles;
};
