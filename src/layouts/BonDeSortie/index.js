/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

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
import Autocomplete from "@mui/material/Autocomplete";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

const BonDeSortieComponent = () => {
  const [bonsDeSortie, setBonsDeSortie] = useState([]);
  const [factures, setFactures] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedFacture, setSelectedFacture] = useState(null);
  const [factureSearchQuery, setFactureSearchQuery] = useState("");
  const [bonItems, setBonItems] = useState([]);
  const [currentBon, setCurrentBon] = useState({
    _id: "",
    numeroBonSortie: "",
    dateSortie: new Date().toISOString().split("T")[0],
    motifSortie: "",
    destination: "",
    matriculeVehicule: "",
    nomChauffeur: "",
    responsableSortie: "",
    recherche: "",
  });
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showBonModal, setShowBonModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMotif, setFilterMotif] = useState("");

  useEffect(() => {
    Promise.all([fetchBonsDeSortie(), fetchFactures(), fetchClients()]).then(() => {
      console.log("Initial data - Clients:", clients);
      console.log("Initial data - Factures:", factures);
    });
  }, []);

  const fetchBonsDeSortie = async () => {
    setLoading(true);
    try {
      const res = await axios.get("https://bskbackend-1.onrender.com/api/bons-de-sortie");
      const data = Array.isArray(res.data) ? res.data : [res.data];
      setBonsDeSortie(data);
    } catch (err) {
      setError(err.response?.data?.error || "Échec de la récupération des bons de sortie.");
    } finally {
      setLoading(false);
    }
  };

  const fetchFactures = async () => {
    try {
      const res = await axios.get("https://bskbackend-1.onrender.com/api/factures");
      setFactures(Array.isArray(res.data) ? res.data : [res.data]);
    } catch (err) {
      setError(err.response?.data?.error || "Échec de la récupération des factures.");
    }
  };

  const fetchClients = async () => {
    try {
      const res = await axios.get("https://bskbackend-1.onrender.com/api/clients");
      setClients(Array.isArray(res.data) ? res.data : [res.data]);
    } catch (err) {
      setError(err.response?.data?.error || "Échec de la récupération des clients.");
    }
  };

  const handleAddItem = () => {
    if (selectedFacture) {
      const facture = factures.find((f) => f._id === selectedFacture._id);
      if (!facture) {
        setError("Facture sélectionnée non trouvée.");
        return;
      }
      setBonItems([
        ...bonItems,
        { facture: selectedFacture._id, numeroFacture: facture.numeroFacture },
      ]);
      setSelectedFacture(null);
      setFactureSearchQuery("");
      setShowAddItemModal(false);
    } else {
      setError("Veuillez sélectionner une facture.");
    }
  };

  const handleDeleteItem = (index) => {
    setBonItems(bonItems.filter((_, idx) => idx !== index));
  };

  const calculateStock = () => {
    const stockChanges = bonItems.reduce(
      (acc, item) => {
        const facture = factures.find((f) => f._id === item.facture);
        const totalQuantite = facture?.liste?.reduce((sum, item) => sum + item.quantite, 0) || 0;
        acc.stockAvant += totalQuantite;
        acc.stockApres += 0; // No quantity reduction, just tracking total
        return acc;
      },
      { stockAvant: 0, stockApres: 0 }
    );
    return stockChanges;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentBon((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateBon = () => {
    setIsEditing(false);
    setCurrentBon({
      _id: "",
      numeroBonSortie: "", // Ignored by backend
      dateSortie: new Date().toISOString().split("T")[0],
      motifSortie: "",
      destination: "",
      matriculeVehicule: "",
      nomChauffeur: "",
      responsableSortie: "",
      recherche: "",
    });
    setBonItems([]);
    setError("");
    setShowBonModal(true);
  };

  const handleEditBon = async (bon) => {
    setIsEditing(true);
    try {
      const res = await axios.get(
        `https://bskbackend-1.onrender.com/api/bons-de-sortie/${bon._id}`
      );
      console.log("Edit bon response:", res.data);
      setCurrentBon({
        ...res.data,
        dateSortie: res.data.dateSortie
          ? new Date(res.data.dateSortie).toISOString().split("T")[0]
          : "",
        recherche: res.data.recherche?.join(", ") || "",
      });
      setBonItems(
        res.data.factures?.map((item) => ({
          facture: item.facture?._id || item.facture,
          numeroFacture:
            item.facture?.numeroFacture ||
            factures.find((f) => f._id === (item.facture?._id || item.facture))?.numeroFacture ||
            "Inconnu",
        })) || []
      );
      setError("");
      setShowBonModal(true);
    } catch (err) {
      setError(err.response?.data?.error || "Échec de la récupération des détails.");
    }
  };

  const handleViewBon = async (bon) => {
    try {
      const res = await axios.get(
        `https://bskbackend-1.onrender.com/api/bons-de-sortie/${bon._id}`
      );
      console.log("View bon response:", res.data);
      setCurrentBon({
        ...res.data,
        dateSortie: res.data.dateSortie
          ? new Date(res.data.dateSortie).toISOString().split("T")[0]
          : "",
        recherche: res.data.recherche?.join(", ") || "",
      });
      setBonItems(
        res.data.factures?.map((item) => ({
          facture: item.facture?._id || item.facture,
          numeroFacture:
            item.facture?.numeroFacture ||
            factures.find((f) => f._id === (item.facture?._id || item.facture))?.numeroFacture ||
            "Inconnu",
        })) || []
      );
      setShowViewModal(true);
    } catch (err) {
      setError(err.response?.data?.error || "Échec de la récupération des détails.");
    }
  };

  const handleDeleteBon = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce bon de sortie ?")) {
      try {
        await axios.delete(`https://bskbackend-1.onrender.com/api/bons-de-sortie/${id}`);
        setBonsDeSortie((prev) => prev.filter((bon) => bon._id !== id));
      } catch (err) {
        setError(err.response?.data?.error || "Échec de la suppression du bon de sortie.");
        fetchBonsDeSortie();
      }
    }
  };

  const handleSubmitBon = async (e) => {
    e.preventDefault();
    const { _id, numeroBonSortie, recherche, ...payload } = currentBon;

    payload.recherche = recherche
      ? recherche
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    payload.factures = bonItems.map((item) => ({ facture: item.facture }));
    const { stockAvant, stockApres } = calculateStock();
    payload.stockAvantSortie = stockAvant;
    payload.stockApresSortie = stockApres;

    console.log("Submit bon payload:", payload);

    if (payload.factures.length === 0) {
      setError("Veuillez ajouter au moins une facture.");
      return;
    }
    for (const item of payload.factures) {
      if (!factures.find((f) => f._id === item.facture)) {
        setError(`Facture invalide: ${item.facture}`);
        return;
      }
    }

    try {
      let response;
      if (isEditing) {
        response = await axios.put(
          `https://bskbackend-1.onrender.com/api/bons-de-sortie/${_id}`,
          payload
        );
      } else {
        response = await axios.post(
          "https://bskbackend-1.onrender.com/api/bons-de-sortie",
          payload
        );
      }
      console.log("Create/Update response:", response.data);
      const populatedBon = await axios.get(
        `https://bskbackend-1.onrender.com/api/bons-de-sortie/${response.data._id}`
      );
      console.log("Populated bon:", populatedBon.data);
      generatePDF(populatedBon.data);
      fetchBonsDeSortie();
      setShowBonModal(false);
    } catch (err) {
      console.error("Error submitting bon:", err.response?.data || err);
      setError(err.response?.data?.error || "Échec de l'enregistrement: " + err.message);
      fetchBonsDeSortie();
    }
  };

  const generatePDF = (bon) => {
    try {
      console.log("Generating PDF with bon:", bon);
      if (!bon) {
        throw new Error("Bon de sortie object is null or undefined");
      }
      if (!bon.factures || !Array.isArray(bon.factures)) {
        throw new Error("Factures list is missing or not an array");
      }

      const doc = new jsPDF();
      const margin = 10;
      const pageWidth = doc.internal.pageSize.width;
      const logoUrl = "/images/Facture3.jpg";
      const logoWidth = pageWidth - 2 * margin;
      const logoHeight = 40;
      const logoX = margin;
      const logoY = 10;

      doc.setFont("helvetica", "normal");

      const addHeader = () => {
        try {
          doc.addImage(logoUrl, "PNG", logoX, logoY, logoWidth, logoHeight);
        } catch (imgError) {
          console.error("Error loading image:", imgError.message);
          setError(
            `Échec du chargement de l'image: ${imgError.message}. Le PDF sera généré sans logo.`
          );
        }

        doc.setFontSize(16);
        doc.text("Bon de Sortie", pageWidth / 2, logoY + logoHeight + 10, { align: "center" });
        doc.setFontSize(12);
        doc.text(`Destination: ${bon.destination || "N/A"}`, margin, logoY + logoHeight + 20);
        doc.text(`Numéro Bon: ${bon.numeroBonSortie || "N/A"}`, margin, logoY + logoHeight + 30);
        doc.text(
          `Date Sortie: ${
            bon.dateSortie ? new Date(bon.dateSortie).toLocaleDateString("fr-FR") : "N/A"
          }`,
          pageWidth - margin,
          logoY + logoHeight + 20,
          { align: "right" }
        );
        doc.text(
          `Motif: ${bon.motifSortie || "N/A"}`,
          pageWidth - margin,
          logoY + logoHeight + 30,
          { align: "right" }
        );
      };

      addHeader();

      // Aggregate quantities, names, and prices from all selected factures
      const productTotals = {};
      let totalHT = 0;
      let totalTTC = 0;

      bon.factures.forEach((item) => {
        const facture = factures.find((f) => f._id === (item.facture?._id || item.facture)) || {};
        facture.liste?.forEach((prod) => {
          const produit = prod.produit?._id || prod.produit;
          if (!productTotals[produit]) {
            productTotals[produit] = {
              quantite: 0,
              nomProduit: prod.produit?.nomProduit || "Inconnu",
              prixUnitaireHT: prod.produit?.prixUnitaireHT || 0,
              tva: prod.produit?.tvaApplicable || 0,
            };
          }
          productTotals[produit].quantite += prod.quantite;
          const productTotalHT = prod.quantite * (prod.produit?.prixUnitaireHT || 0);
          totalHT += productTotalHT;
          totalTTC += productTotalHT * (1 + (prod.produit?.tvaApplicable || 0) / 100);
        });
      });

      const tableBody = Object.entries(productTotals).map(([produitId, data]) => {
        const totalPrice = data.quantite * data.prixUnitaireHT;
        return [
          data.quantite,
          data.nomProduit,
          `${data.prixUnitaireHT.toFixed(2)} DT`,
          `${data.tva.toFixed(2)}%`,
          `${totalPrice.toFixed(2)} DT`,
        ];
      });

      autoTable(doc, {
        startY: logoY + logoHeight + 40,
        head: [["Quantité Totale", "Désignation", "Prix Unitaire HT", "TVA", "Prix Total HT"]],
        body: tableBody,
        theme: "grid",
        margin: { top: logoY + logoHeight + 40, left: margin, right: margin },
        styles: { fontSize: 10, cellPadding: 2, font: "helvetica" },
        headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0] },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: "auto" },
          2: { cellWidth: 40 },
          3: { cellWidth: 30 },
          4: { cellWidth: 40 },
        },
        didDrawPage: addHeader,
      });

      const itemsFinalY = doc.lastAutoTable.finalY || logoY + logoHeight + 50;
      const detailsStartY = itemsFinalY + 10;

      autoTable(doc, {
        startY: detailsStartY,
        body: [
          ["Matricule Véhicule", bon.matriculeVehicule || "N/A"],
          ["Nom Chauffeur", bon.nomChauffeur || "N/A"],
          ["Responsable Sortie", bon.responsableSortie || "N/A"],
          ["Stock Avant Sortie", `${bon.stockAvantSortie || 0}`],
          ["Stock Après Sortie", `${bon.stockApresSortie || 0}`],
        ],
        theme: "grid",
        margin: { left: margin + 50, right: margin },
        styles: { fontSize: 10, cellPadding: 2, font: "helvetica" },
      });

      const detailsFinalY = doc.lastAutoTable.finalY || detailsStartY;
      const totalsStartY = detailsFinalY + 10;

      autoTable(doc, {
        startY: totalsStartY,
        body: [
          ["Montant HT", `${totalHT.toFixed(2)} DT`],
          ["TVA", `${(totalTTC - totalHT).toFixed(2)} DT`],
          ["Montant TTC", `${totalTTC.toFixed(2)} DT`],
        ],
        theme: "grid",
        margin: { left: margin + 70, right: margin },
        styles: { fontSize: 10, cellPadding: 2, font: "helvetica" },
      });

      const totalsFinalY = doc.lastAutoTable.finalY || totalsStartY;
      doc.text("Arrêté le présent bon de sortie à la somme de :", margin, totalsFinalY + 10);
      doc.text("(en lettres)", margin, totalsFinalY + 20);
      doc.text("Signature & Cachet", pageWidth - margin, totalsFinalY + 20, { align: "right" });

      doc.save(`bon_de_sortie_${bon.numeroBonSortie || bon._id}.pdf`);
    } catch (err) {
      console.error("Erreur lors de la génération du PDF:", err.message);
      setError(`Échec de la génération du PDF: ${err.message}`);
    }
  };

  const filteredBons = bonsDeSortie.filter((bon) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = query
      ? bon.numeroBonSortie.toLowerCase().includes(query) ||
        bon.destination?.toLowerCase().includes(query) ||
        bon.recherche?.some((term) => term.toLowerCase().includes(query))
      : true;
    const matchesMotif = filterMotif ? bon.motifSortie === filterMotif : true;
    return matchesSearch && matchesMotif;
  });

  const filteredFactures = factures.filter((facture) => {
    const query = factureSearchQuery.toLowerCase();
    const client = clients.find((c) => c._id === (facture.client?._id || facture.client));
    return (
      !query ||
      facture.numeroFacture.toLowerCase().includes(query) ||
      client?.nomRaisonSociale?.toLowerCase().includes(query)
    );
  });

  const bonTableColumns = [
    { Header: "Numéro Bon", accessor: "numeroBonSortie", align: "center" },
    { Header: "Destination", accessor: "destination", align: "center" },
    { Header: "Date Sortie", accessor: "dateSortie", align: "center" },
    { Header: "Motif", accessor: "motifSortie", align: "center" },
    { Header: "Actions", accessor: "actions", align: "center" },
  ];

  const bonTableRows = filteredBons.map((bon) => ({
    numeroBonSortie: bon.numeroBonSortie || "N/A",
    destination: bon.destination || "N/A",
    dateSortie: bon.dateSortie ? new Date(bon.dateSortie).toLocaleDateString() : "N/A",
    motifSortie: bon.motifSortie || "N/A",
    actions: (
      <MDBox display="flex" justifyContent="center" alignItems="center" gap={1}>
        <IconButton
          color="info"
          onClick={() => handleViewBon(bon)}
          disabled={!bon._id}
          aria-label="Voir les détails"
        >
          <Icon>visibility</Icon>
        </IconButton>
        <IconButton
          color="warning"
          onClick={() => handleEditBon(bon)}
          disabled={!bon._id}
          aria-label="Modifier"
        >
          <Icon>edit</Icon>
        </IconButton>
        <IconButton
          color="error"
          onClick={() => handleDeleteBon(bon._id)}
          disabled={!bon._id}
          aria-label="Supprimer"
        >
          <Icon>delete</Icon>
        </IconButton>
      </MDBox>
    ),
  }));

  const itemTableColumns = [
    { Header: "Numéro Facture", accessor: "numeroFacture", align: "center" },
    { Header: "Actions", accessor: "actions", align: "center" },
  ];

  const itemTableRows = bonItems.map((item, index) => ({
    numeroFacture: item.numeroFacture || "Inconnu",
    actions: (
      <MDBox display="flex" justifyContent="center" alignItems="center" gap={1}>
        <IconButton color="error" onClick={() => handleDeleteItem(index)} aria-label="Supprimer">
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

  const handleClearFilters = () => {
    setSearchQuery("");
    setFilterMotif("");
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
                  Gestion des Bons de Sortie
                </MDTypography>
                <MDBox>
                  <MDButton
                    variant="gradient"
                    color="info"
                    onClick={handleCreateBon}
                    aria-label="Créer un bon de sortie"
                  >
                    <Icon>add</Icon> Nouveau Bon de Sortie
                  </MDButton>
                </MDBox>
              </MDBox>

              <MDBox mb={3}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <MDTypography variant="body2" fontWeight="bold" mb={1}>
                      Recherche
                    </MDTypography>
                    <TextField
                      fullWidth
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher (numéro, destination, etc.)"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <MDTypography variant="body2" fontWeight="bold" mb={1}>
                      Motif
                    </MDTypography>
                    <Select
                      fullWidth
                      value={filterMotif}
                      onChange={(e) => setFilterMotif(e.target.value)}
                      displayEmpty
                      variant="outlined"
                    >
                      <MenuItem value="">Tous</MenuItem>
                      {["Vente", "Don", "Transfert", "Usage interne"].map((motif) => (
                        <MenuItem key={motif} value={motif}>
                          {motif}
                        </MenuItem>
                      ))}
                    </Select>
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
                  table={{ columns: bonTableColumns, rows: bonTableRows }}
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

      <Modal open={showBonModal} onClose={() => setShowBonModal(false)}>
        <MDBox sx={modalStyle}>
          <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <MDTypography variant="h5" id="bonModalLabel">
              {isEditing ? "Modifier le Bon de Sortie" : "Créer un Bon de Sortie"}
            </MDTypography>
            <IconButton onClick={() => setShowBonModal(false)} aria-label="Fermer">
              <Icon>close</Icon>
            </IconButton>
          </MDBox>
          <form onSubmit={handleSubmitBon}>
            <Grid container spacing={2}>
              {[
                { label: "Date Sortie", name: "dateSortie", type: "date", required: true },
                { label: "Destination", name: "destination", type: "text" },
                { label: "Matricule Véhicule", name: "matriculeVehicule", type: "text" },
                { label: "Nom Chauffeur", name: "nomChauffeur", type: "text" },
                { label: "Responsable Sortie", name: "responsableSortie", type: "text" },
                { label: "Recherche (séparé par virgules)", name: "recherche", type: "text" },
              ].map(({ label, name, type, required }) => (
                <Grid item xs={6} key={name}>
                  <MDTypography variant="body2" fontWeight="bold" mb={1}>
                    {label} {required && <span style={{ color: "red" }}>*</span>}
                  </MDTypography>
                  <TextField
                    fullWidth
                    type={type}
                    name={name}
                    value={currentBon[name] ?? ""}
                    onChange={handleInputChange}
                    variant="outlined"
                    required={required}
                    InputLabelProps={type === "date" ? { shrink: true } : {}}
                  />
                </Grid>
              ))}
              <Grid item xs={6}>
                <MDTypography variant="body2" fontWeight="bold" mb={1}>
                  Motif Sortie <span style={{ color: "red" }}>*</span>
                </MDTypography>
                <Select
                  fullWidth
                  name="motifSortie"
                  value={currentBon.motifSortie || ""}
                  onChange={handleInputChange}
                  variant="outlined"
                  required
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    Sélectionner un motif
                  </MenuItem>
                  {["Vente", "Don", "Transfert", "Usage interne"].map((motif) => (
                    <MenuItem key={motif} value={motif}>
                      {motif}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
            </Grid>
            <MDBox mt={3}>
              <MDTypography variant="h6" fontWeight="medium" mb={2}>
                Factures
              </MDTypography>
              {bonItems.length > 0 ? (
                <DataTable
                  table={{ columns: itemTableColumns, rows: itemTableRows }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={true}
                  noEndBorder
                />
              ) : (
                <MDTypography variant="body2">Aucune facture ajoutée.</MDTypography>
              )}
              <MDButton
                variant="outlined"
                color="info"
                onClick={() => setShowAddItemModal(true)}
                sx={{ mt: 2 }}
              >
                Ajouter une facture
              </MDButton>
            </MDBox>
            {error && (
              <MDBox mt={2}>
                <MDTypography variant="body2" color="error">
                  {error}
                </MDTypography>
              </MDBox>
            )}
            <MDBox mt={3} display="flex" justifyContent="flex-end" gap={2}>
              <MDButton variant="outlined" color="secondary" onClick={() => setShowBonModal(false)}>
                Annuler
              </MDButton>
              <MDButton
                variant="gradient"
                color="success"
                type="submit"
                disabled={bonItems.length === 0 || !currentBon.motifSortie}
              >
                {isEditing ? "Mettre à jour" : "Créer et Télécharger PDF"}
              </MDButton>
            </MDBox>
          </form>
        </MDBox>
      </Modal>

      <Modal open={showAddItemModal} onClose={() => setShowAddItemModal(false)}>
        <MDBox sx={modalStyle}>
          <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <MDTypography variant="h5" id="addItemModalLabel">
              Ajouter une facture
            </MDTypography>
            <IconButton onClick={() => setShowAddItemModal(false)} aria-label="Fermer">
              <Icon>close</Icon>
            </IconButton>
          </MDBox>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <MDTypography variant="body2" fontWeight="bold" mb={1}>
                Rechercher une facture <span style={{ color: "red" }}>*</span>
              </MDTypography>
              <Autocomplete
                options={filteredFactures}
                getOptionLabel={(facture) =>
                  `${facture.numeroFacture} (Client: ${
                    clients.find((c) => c._id === (facture.client?._id || facture.client))
                      ?.nomRaisonSociale || "N/A"
                  }, Montant TTC: ${facture.montantTTC || 0})`
                }
                value={selectedFacture}
                onChange={(event, newValue) => setSelectedFacture(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    placeholder="Rechercher par numéro de facture ou client"
                    onChange={(e) => setFactureSearchQuery(e.target.value)}
                  />
                )}
                noOptionsText="Aucune facture trouvée"
              />
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
            <MDButton
              variant="outlined"
              color="secondary"
              onClick={() => {
                setShowAddItemModal(false);
                setFactureSearchQuery("");
                setSelectedFacture(null);
              }}
            >
              Annuler
            </MDButton>
            <MDButton
              variant="gradient"
              color="info"
              onClick={handleAddItem}
              disabled={!selectedFacture}
            >
              Ajouter
            </MDButton>
          </MDBox>
        </MDBox>
      </Modal>

      <Modal open={showViewModal} onClose={() => setShowViewModal(false)}>
        <MDBox sx={modalStyle}>
          <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <MDTypography variant="h5" id="viewModalLabel">
              Détails du Bon de Sortie
            </MDTypography>
            <IconButton onClick={() => setShowViewModal(false)} aria-label="Fermer">
              <Icon>close</Icon>
            </IconButton>
          </MDBox>
          <Grid container spacing={2}>
            {[
              { label: "Numéro Bon Sortie", value: currentBon.numeroBonSortie },
              { label: "Destination", value: currentBon.destination || "N/A" },
              {
                label: "Date Sortie",
                value: currentBon.dateSortie
                  ? new Date(currentBon.dateSortie).toLocaleDateString()
                  : "N/A",
              },
              { label: "Motif Sortie", value: currentBon.motifSortie || "N/A" },
              { label: "Matricule Véhicule", value: currentBon.matriculeVehicule || "N/A" },
              { label: "Nom Chauffeur", value: currentBon.nomChauffeur || "N/A" },
              { label: "Responsable Sortie", value: currentBon.responsableSortie || "N/A" },
              { label: "Stock Avant Sortie", value: `${currentBon.stockAvantSortie || 0}` },
              { label: "Stock Après Sortie", value: `${currentBon.stockApresSortie || 0}` },
              { label: "Recherche", value: currentBon.recherche || "N/A" },
            ].map(({ label, value }) => (
              <Grid item xs={6} key={label}>
                <MDTypography variant="body2" fontWeight="bold" mb={1}>
                  {label}
                </MDTypography>
                <TextField
                  fullWidth
                  value={value}
                  variant="outlined"
                  InputProps={{ readOnly: true }}
                  aria-readonly="true"
                />
              </Grid>
            ))}
          </Grid>
          {bonItems.length > 0 && (
            <MDBox mt={3}>
              <MDTypography variant="h6" fontWeight="medium" mb={2}>
                Factures
              </MDTypography>
              <DataTable
                table={{ columns: itemTableColumns, rows: itemTableRows }}
                isSorted={false}
                entriesPerPage={false}
                showTotalEntries={true}
                noEndBorder
              />
            </MDBox>
          )}
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

export default BonDeSortieComponent;
