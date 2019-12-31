namespace ts {
	export function preprocess(sf: SourceFile, options: CompilerOptions): SourceFile {
		performance.mark("beforePreprocess");
		if (options.preprocessors !== undefined) {
			sf = options.preprocessors.reduce(applyPreprocessor, sf);
		}
		performance.mark("afterPreprocess");
		performance.measure("Preprocess", "beforePreprocess", "afterPreprocess");
		return sf;
	}

	function applyPreprocessor(sf: SourceFile, preprocessorImport: PreprocessorImport): SourceFile {
		// I'm not sure why the logic for language server plugins is so complex.
		// So this might be a gross oversimplification.

		if (sf.isDeclarationFile) {
			// Skip declaration files
			return sf;
		}

		console.log("Applying preprocessor:", preprocessorImport.name, "to file:", sf.fileName);
		let path = require.resolve(preprocessorImport.name, { paths: [sf.fileName] });
		console.log(path);
		let preprocessor: PreprocessorModule = require(path);
		let ret = preprocessor.process(
			sf,
			preprocessorImport.options,
			{
				emitDiagnostic: (diag) => sf.preprocessorDiagnostics.push({ ...diag, file: sf })
			}
		);
		console.log("Done with the preprocessor");
		return ret;
	}
}