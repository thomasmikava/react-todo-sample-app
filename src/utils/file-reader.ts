const readFile = (file): Promise<any> => {
	const fileReader = new FileReader();

	return new Promise((resolve, reject) => {
		fileReader.onerror = () => {
			fileReader.abort();
			reject(new Error("Problem parsing file"));
		};

		fileReader.onload = () => {
			resolve(fileReader.result!);
		};

		fileReader.readAsText(file);
	});
};

export { readFile };
