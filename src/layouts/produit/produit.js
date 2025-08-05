/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim
*/

import React, { useState, useEffect } from "react";
import axios from "axios";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

// Data
const tableColumns = [
  { Header: "Référence", accessor: "referenceProduit", align: "center" },
  { Header: "Nom", accessor: "nomProduit", align: "center" },
  { Header: "Catégorie", accessor: "categorie", align: "center" },
  { Header: "Prix Unitaire HT", accessor: "prixUnitaireHT", align: "center" },
  { Header: "TVA", accessor: "tvaApplicable", align: "center" },
  { Header: "Stock Actuel", accessor: "stockActuel", align: "center" },
  { Header: "Fournisseur", accessor: "fournisseurPrincipal", align: "center" },
  { Header: "Actions", accessor: "actions", align: "center" },
];

const ProduitComponent = () => {
  const [produits, setProduits] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentProduit, setCurrentProduit] = useState({
    _id: "",
    referenceProduit: "",
    nomProduit: "",
    categorie: "",
    description: "",
    prixUnitaireHT: 0,
    tvaApplicable: 0,
    stockActuel: 0,
    stockMinimal: 0,
    seuilReapprovisionnement: 0,
    fournisseurPrincipal: "",
    quantite: 0,
    stockAvantMouvement: 0,
    stockApresMouvement: 0,
    recherche: "",
    rechercheCorrespondance: "",
  });
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategorie, setFilterCategorie] = useState("");
  const [filterFournisseur, setFilterFournisseur] = useState("");
  const [minStock, setMinStock] = useState("");
  const [maxStock, setMaxStock] = useState("");
  const [minPrix, setMinPrix] = useState("");
  const [maxPrix, setMaxPrix] = useState("");

  useEffect(() => {
    fetchProduits();
    fetchFournisseurs();
  }, []);

  const fetchProduits = async () => {
    setLoading(true);
    try {
      const res = await axios.get("https://bskbackend-1.onrender.com/api/produits");
      const data = Array.isArray(res.data) ? res.data : [res.data];
      setProduits(data);
    } catch (err) {
      setError(err.response?.data?.error || "Échec de la récupération des produits.");
    } finally {
      setLoading(false);
    }
  };

  const fetchFournisseurs = async () => {
    try {
      const res = await axios.get("https://bskbackend-1.onrender.com/api/fournisseurs");
      setFournisseurs(Array.isArray(res.data) ? res.data : [res.data]);
    } catch (err) {
      setError(err.response?.data?.error || "Échec de la récupération des fournisseurs.");
    }
  };

  // Get unique values for dropdowns
  const uniqueCategories = [
    ...new Set(produits.map((produit) => produit.categorie).filter(Boolean)),
  ].sort();
  const uniqueFournisseurs = fournisseurs
    .map((f) => ({
      _id: f._id,
      nom: f.nomRaisonSociale,
    }))
    .sort((a, b) => a.nom.localeCompare(b.nom));

  const handleAdd = () => {
    setIsEditing(false);
    setCurrentProduit({
      _id: "",
      referenceProduit: "", // Ignored by backend
      nomProduit: "",
      categorie: "",
      description: "",
      prixUnitaireHT: 0,
      tvaApplicable: 0,
      stockActuel: 0,
      stockMinimal: 0,
      seuilReapprovisionnement: 0,
      fournisseurPrincipal: "",
      quantite: 0,
      stockAvantMouvement: 0,
      stockApresMouvement: 0,
      recherche: "",
      rechercheCorrespondance: "",
    });
    setError("");
    setShowModal(true);
  };

  const handleEdit = (produit) => {
    setIsEditing(true);
    setCurrentProduit({
      ...produit,
      recherche: produit.recherche?.join(", ") || "",
      rechercheCorrespondance: produit.rechercheCorrespondance?.join(", ") || "",
      stockActuel: Math.max(0, produit.stockActuel || 0),
      stockMinimal: Math.max(0, produit.stockMinimal || 0),
      seuilReapprovisionnement: Math.max(0, produit.seuilReapprovisionnement || 0),
      quantite: Math.max(0, produit.quantite || 0),
      stockAvantMouvement: Math.max(0, produit.stockAvantMouvement || 0),
      stockApresMouvement: Math.max(0, produit.stockApresMouvement || 0),
      fournisseurPrincipal: produit.fournisseurPrincipal?._id || produit.fournisseurPrincipal || "",
    });
    setError("");
    setShowModal(true);
  };

  const handleView = async (produit) => {
    try {
      const res = await axios.get(`https://bskbackend-1.onrender.com/api/produits/${produit._id}`);
      setCurrentProduit({
        ...res.data,
        recherche: res.data.recherche?.join(", ") || "",
        rechercheCorrespondance: res.data.rechercheCorrespondance?.join(", ") || "",
        stockActuel: Math.max(0, res.data.stockActuel || 0),
        stockMinimal: Math.max(0, res.data.stockMinimal || 0),
        seuilReapprovisionnement: Math.max(0, res.data.seuilReapprovisionnement || 0),
        quantite: Math.max(0, res.data.quantite || 0),
        stockAvantMouvement: Math.max(0, res.data.stockAvantMouvement || 0),
        stockApresMouvement: Math.max(0, res.data.stockApresMouvement || 0),
        fournisseurPrincipal:
          res.data.fournisseurPrincipal?._id || res.data.fournisseurPrincipal || "",
      });
      setShowViewModal(true);
    } catch (err) {
      setError(err.response?.data?.error || "Échec de la récupération des détails.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      try {
        await axios.delete(`https://bskbackend-1.onrender.com/api/produits/${id}`);
        setProduits((prev) => prev.filter((produit) => produit._id !== id));
      } catch (err) {
        setError(err.response?.data?.error || "Échec de la suppression du produit.");
        fetchProduits();
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (
      [
        "prixUnitaireHT",
        "tvaApplicable",
        "stockActuel",
        "stockMinimal",
        "seuilReapprovisionnement",
        "quantite",
        "stockAvantMouvement",
        "stockApresMouvement",
      ].includes(name)
    ) {
      newValue = value === "" ? 0 : Math.max(0, Number(value));
    }
    setCurrentProduit((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { _id, referenceProduit, recherche, rechercheCorrespondance, ...payload } =
      currentProduit;

    // Convert comma-separated strings to arrays
    payload.recherche = recherche
      ? recherche
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    payload.rechercheCorrespondance = rechercheCorrespondance
      ? rechercheCorrespondance
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    if (!payload.nomProduit || !payload.prixUnitaireHT || !payload.tvaApplicable) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    if (payload.prixUnitaireHT <= 0) {
      setError("Le prix unitaire HT doit être supérieur à 0.");
      return;
    }

    if (payload.tvaApplicable < 0) {
      setError("La TVA applicable ne peut pas être négative.");
      return;
    }

    try {
      let response;
      if (isEditing) {
        response = await axios.put(
          `https://bskbackend-1.onrender.com/api/produits/${_id}`,
          payload
        );
      } else {
        response = await axios.post("https://bskbackend-1.onrender.com/api/produits", payload);
        setProduits((prev) => [...prev, response.data]);
      }
      fetchProduits();
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.error || "Échec de l'enregistrement.");
      fetchProduits();
    }
  };

  // Filter produits based on search criteria
  const filteredProduits = produits.filter((produit) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = query
      ? produit.referenceProduit.toLowerCase().includes(query) ||
        produit.nomProduit.toLowerCase().includes(query) ||
        (produit.categorie?.toLowerCase().includes(query) ?? false) ||
        (produit.description?.toLowerCase().includes(query) ?? false) ||
        produit.prixUnitaireHT.toString().includes(query) ||
        produit.tvaApplicable.toString().includes(query) ||
        produit.stockActuel.toString().includes(query) ||
        produit.recherche?.some((term) => term.toLowerCase().includes(query)) ||
        produit.rechercheCorrespondance?.some((term) => term.toLowerCase().includes(query)) ||
        (produit.fournisseurPrincipal?.nomRaisonSociale?.toLowerCase().includes(query) ?? false)
      : true;
    const matchesCategorie = filterCategorie ? produit.categorie === filterCategorie : true;
    const matchesFournisseur = filterFournisseur
      ? produit.fournisseurPrincipal?._id === filterFournisseur
      : true;
    const matchesMinStock = minStock ? produit.stockActuel >= Number(minStock) : true;
    const matchesMaxStock = maxStock ? produit.stockActuel <= Number(maxStock) : true;
    const matchesMinPrix = minPrix ? produit.prixUnitaireHT >= Number(minPrix) : true;
    const matchesMaxPrix = maxPrix ? produit.prixUnitaireHT <= Number(maxPrix) : true;

    return (
      matchesSearch &&
      matchesCategorie &&
      matchesFournisseur &&
      matchesMinStock &&
      matchesMaxStock &&
      matchesMinPrix &&
      matchesMaxPrix
    );
  });

  const tableRows = filteredProduits.map((produit) => ({
    referenceProduit: produit.referenceProduit || "N/A",
    nomProduit: produit.nomProduit || "N/A",
    categorie: produit.categorie || "N/A",
    prixUnitaireHT: `${(produit.prixUnitaireHT || 0).toFixed(2)} DT`,
    tvaApplicable: `${(produit.tvaApplicable || 0).toFixed(2)} %`,
    stockActuel: produit.stockActuel || 0,
    fournisseurPrincipal: produit.fournisseurPrincipal?.nomRaisonSociale || "N/A",
    actions: (
      <MDBox display="flex" justifyContent="center" alignItems="center" gap={1}>
        <IconButton
          color="info"
          onClick={() => handleView(produit)}
          disabled={!produit._id}
          aria-label="Voir les détails"
        >
          <Icon>visibility</Icon>
        </IconButton>
        <IconButton
          color="warning"
          onClick={() => handleEdit(produit)}
          disabled={!produit._id}
          aria-label="Modifier"
        >
          <Icon>edit</Icon>
        </IconButton>
        <IconButton
          color="error"
          onClick={() => handleDelete(produit._id)}
          disabled={!produit._id}
          aria-label="Supprimer"
        >
          <Icon>delete</Icon>
        </IconButton>
      </MDBox>
    ),
  }));

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "80%",
    maxWidth: "600px",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setFilterCategorie("");
    setFilterFournisseur("");
    setMinStock("");
    setMaxStock("");
    setMinPrix("");
    setMaxPrix("");
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <MDTypography variant="h4" fontWeight="medium">
                  Gestion des Produits
                </MDTypography>
                <MDBox>
                  <MDButton
                    variant="gradient"
                    color="info"
                    onClick={handleAdd}
                    aria-label="Ajouter un nouveau produit"
                  >
                    <Icon>add</Icon> Nouveau Produit
                  </MDButton>
                </MDBox>
              </MDBox>

              {/* Filter Inputs */}
              <MDBox mb={3}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={3}>
                    <MDTypography variant="body2" fontWeight="bold" mb={1}>
                      Recherche
                    </MDTypography>
                    <TextField
                      fullWidth
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher (référence, nom, etc.)"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <MDTypography variant="body2" fontWeight="bold" mb={1}>
                      Catégorie
                    </MDTypography>
                    <Select
                      fullWidth
                      value={filterCategorie}
                      onChange={(e) => setFilterCategorie(e.target.value)}
                      displayEmpty
                      variant="outlined"
                    >
                      <MenuItem value="">Toutes</MenuItem>
                      {uniqueCategories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <MDTypography variant="body2" fontWeight="bold" mb={1}>
                      Fournisseur
                    </MDTypography>
                    <Select
                      fullWidth
                      value={filterFournisseur}
                      onChange={(e) => setFilterFournisseur(e.target.value)}
                      displayEmpty
                      variant="outlined"
                    >
                      <MenuItem value="">Tous</MenuItem>
                      {uniqueFournisseurs.map((fournisseur) => (
                        <MenuItem key={fournisseur._id} value={fournisseur._id}>
                          {fournisseur.nom}
                        </MenuItem>
                      ))}
                    </Select>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <MDTypography variant="body2" fontWeight="bold" mb={1}>
                      Stock Min
                    </MDTypography>
                    <TextField
                      fullWidth
                      type="number"
                      value={minStock}
                      onChange={(e) => setMinStock(e.target.value)}
                      variant="outlined"
                      inputProps={{ min: 0 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <MDTypography variant="body2" fontWeight="bold" mb={1}>
                      Stock Max
                    </MDTypography>
                    <TextField
                      fullWidth
                      type="number"
                      value={maxStock}
                      onChange={(e) => setMaxStock(e.target.value)}
                      variant="outlined"
                      inputProps={{ min: 0 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <MDTypography variant="body2" fontWeight="bold" mb={1}>
                      Prix Min (DT)
                    </MDTypography>
                    <TextField
                      fullWidth
                      type="number"
                      value={minPrix}
                      onChange={(e) => setMinPrix(e.target.value)}
                      variant="outlined"
                      inputProps={{ min: 0, step: "0.01" }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <MDTypography variant="body2" fontWeight="bold" mb={1}>
                      Prix Max (DT)
                    </MDTypography>
                    <TextField
                      fullWidth
                      type="number"
                      value={maxPrix}
                      onChange={(e) => setMaxPrix(e.target.value)}
                      variant="outlined"
                      inputProps={{ min: 0, step: "0.01" }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <MDButton variant="outlined" color="secondary" onClick={handleClearFilters}>
                      Effacer les filtres
                    </MDButton>
                  </Grid>
                </Grid>
              </MDBox>

              {error && (
                <MDBox mb={2}>
                  <MDTypography variant="body2" color="error">
                    {error}
                  </MDTypography>
                </MDBox>
              )}
              {loading ? (
                <MDBox display="flex" justifyContent="center" alignItems="center" py={3}>
                  <MDTypography variant="body2">Chargement...</MDTypography>
                </MDBox>
              ) : (
                <DataTable
                  table={{ columns: tableColumns, rows: tableRows }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={true}
                  noEndBorder
                />
              )}
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>

      {/* Add/Edit Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <MDBox sx={modalStyle}>
          <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <MDTypography variant="h5" id="produitModalLabel">
              {isEditing ? "Modifier un produit" : "Ajouter un nouveau produit"}
            </MDTypography>
            <IconButton onClick={() => setShowModal(false)} aria-label="Fermer">
              <Icon>close</Icon>
            </IconButton>
          </MDBox>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {[
                { label: "Nom du Produit", name: "nomProduit", type: "text", required: true },
                { label: "Catégorie", name: "categorie", type: "text" },
                { label: "Description", name: "description", type: "text" },
                {
                  label: "Prix Unitaire HT (DT)",
                  name: "prixUnitaireHT",
                  type: "number",
                  min: 0.01,
                  step: "0.01",
                  required: true,
                },
                {
                  label: "TVA Applicable (%)",
                  name: "tvaApplicable",
                  type: "number",
                  min: 0,
                  step: "0.01",
                  required: true,
                },
                { label: "Stock Actuel", name: "stockActuel", type: "number", min: 0 },
                { label: "Stock Minimal", name: "stockMinimal", type: "number", min: 0 },
                {
                  label: "Seuil de Réapprovisionnement",
                  name: "seuilReapprovisionnement",
                  type: "number",
                  min: 0,
                },
                { label: "Quantité", name: "quantite", type: "number", min: 0 },
                {
                  label: "Stock Avant Mouvement",
                  name: "stockAvantMouvement",
                  type: "number",
                  min: 0,
                },
                {
                  label: "Stock Après Mouvement",
                  name: "stockApresMouvement",
                  type: "number",
                  min: 0,
                },
                { label: "Recherche (séparé par virgules)", name: "recherche", type: "text" },
                {
                  label: "Recherche Correspondance (séparé par virgules)",
                  name: "rechercheCorrespondance",
                  type: "text",
                },
              ].map(({ label, name, type, min, step, required }) => (
                <Grid item xs={6} key={name}>
                  <MDTypography variant="body2" fontWeight="bold" mb={1}>
                    {label} {required && <span style={{ color: "red" }}>*</span>}
                  </MDTypography>
                  <TextField
                    fullWidth
                    type={type}
                    id={name}
                    name={name}
                    value={currentProduit[name] ?? ""}
                    onChange={handleInputChange}
                    variant="outlined"
                    required={required}
                    inputProps={{ min, step }}
                    aria-required={required}
                    aria-describedby={`${name}-error`}
                  />
                </Grid>
              ))}
              <Grid item xs={6}>
                <MDTypography variant="body2" fontWeight="bold" mb={1}>
                  Fournisseur Principal
                </MDTypography>
                <Select
                  fullWidth
                  name="fournisseurPrincipal"
                  value={currentProduit.fournisseurPrincipal || ""}
                  onChange={handleInputChange}
                  variant="outlined"
                  displayEmpty
                >
                  <MenuItem value="">Aucun</MenuItem>
                  {fournisseurs.map((fournisseur) => (
                    <MenuItem key={fournisseur._id} value={fournisseur._id}>
                      {fournisseur.nomRaisonSociale}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
            </Grid>
            {error && (
              <MDBox mt={2}>
                <MDTypography variant="body2" color="error">
                  {error}
                </MDTypography>
              </MDBox>
            )}
            <MDBox mt={3} display="flex" justifyContent="flex-end" gap={2}>
              <MDButton variant="outlined" color="secondary" onClick={() => setShowModal(false)}>
                Annuler
              </MDButton>
              <MDButton variant="gradient" color="info" type="submit">
                {isEditing ? "Mettre à jour" : "Enregistrer"}
              </MDButton>
            </MDBox>
          </form>
        </MDBox>
      </Modal>

      {/* View Modal */}
      <Modal open={showViewModal} onClose={() => setShowViewModal(false)}>
        <MDBox sx={modalStyle}>
          <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <MDTypography variant="h5" id="viewModalLabel">
              Détails du Produit
            </MDTypography>
            <IconButton onClick={() => setShowViewModal(false)} aria-label="Fermer">
              <Icon>close</Icon>
            </IconButton>
          </MDBox>
          <Grid container spacing={2}>
            {[
              { label: "Référence Produit", value: currentProduit.referenceProduit },
              { label: "Nom du Produit", value: currentProduit.nomProduit },
              { label: "Catégorie", value: currentProduit.categorie },
              { label: "Description", value: currentProduit.description },
              {
                label: "Prix Unitaire HT (DT)",
                value: Number(currentProduit.prixUnitaireHT || 0).toFixed(2),
              },
              {
                label: "TVA Applicable (%)",
                value: Number(currentProduit.tvaApplicable || 0).toFixed(2),
              },
              { label: "Stock Actuel", value: currentProduit.stockActuel },
              { label: "Stock Minimal", value: currentProduit.stockMinimal },
              {
                label: "Seuil de Réapprovisionnement",
                value: currentProduit.seuilReapprovisionnement,
              },
              { label: "Quantité", value: currentProduit.quantite },
              { label: "Stock Avant Mouvement", value: currentProduit.stockAvantMouvement },
              { label: "Stock Après Mouvement", value: currentProduit.stockApresMouvement },
              { label: "Recherche", value: currentProduit.recherche },
              { label: "Recherche Correspondance", value: currentProduit.rechercheCorrespondance },
              {
                label: "Fournisseur Principal",
                value:
                  fournisseurs.find((f) => f._id === currentProduit.fournisseurPrincipal)
                    ?.nomRaisonSociale || "N/A",
              },
            ].map(({ label, value }) => (
              <Grid item xs={6} key={label}>
                <MDTypography variant="body2" fontWeight="bold" mb={1}>
                  {label}
                </MDTypography>
                <TextField
                  fullWidth
                  value={value ?? "N/A"}
                  variant="outlined"
                  InputProps={{ readOnly: true }}
                  aria-readonly="true"
                />
              </Grid>
            ))}
          </Grid>
          <MDBox mt={3} display="flex" justifyContent="flex-end">
            <MDButton variant="outlined" color="secondary" onClick={() => setShowViewModal(false)}>
              Fermer
            </MDButton>
          </MDBox>
        </MDBox>
      </Modal>

      <Footer />
    </DashboardLayout>
  );
};

export default ProduitComponent;
