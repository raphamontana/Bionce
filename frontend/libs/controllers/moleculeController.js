import BMOADController from "./bindingMOADController";
import ChemblController from "./chemblController";
import PDBController from "./pdbController";
import PubchemController from "./pubchemController";

function compare(a, b) {
  const bindingA = a[0].proteinID.toUpperCase();
  const bindingB = b[0].proteinID.toUpperCase();

  let comparison = 0;
  if (bindingA > bindingB) {
    comparison = 1;
  } else if (bindingA < bindingB) {
    comparison = -1;
  }
  return comparison;
}

class MoleculeController {

  static async searchBySmiles(smiles) {
    const pubchem = PubchemController.searchBySmiles(smiles);
    const chembl = ChemblController.similarity(smiles);
    const pdb = await PDBController.searchLigandBySmiles(smiles);
    const bindings = [];
    if (pdb) {
      await Promise.all(
        pdb.structuresList.map(async structure => {
          let binding = await BMOADController.fetch(structure);
          if (binding.length > 0) {
            bindings.push(binding);
          }
        })
      );
      bindings.sort(compare);
    }
    let molecule = {
      smiles: smiles,
      pubchem: await pubchem,
      chembl: await chembl,
      pdb: pdb,
      bindings: bindings
    };
    return(molecule);
  }

  static async searchByName(query) {
    const pubchem = PubchemController.searchByName(query);
    const chembl = ChemblController.searchByName(query);
    return({pubchem, chembl});
  }

}

export default MoleculeController;