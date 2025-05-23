import type { Vehicule } from "./logistique-types"

export const vehiculesInitiaux: Vehicule[] = [
  {
    id: "1",
    societe: "OT",
    marque: "CITROEN",
    modele: "JUMPY",
    immatriculation: "ED-612-MD",
    etat: "EN CIRCULATION",
    proprietaire: "ACHAT",
    dateMiseEnCirculation: new Date("2016-06-28"),
    kilometrage: 129800,
    kmProchaineRevision: 145000,
    dateLimiteControleTechnique: new Date("2024-10-13"),
    dateLimiteControlePollution: new Date("2023-10-13"),
  },
  {
    id: "2",
    societe: "OT",
    marque: "PEUGEOT",
    modele: "208",
    immatriculation: "EK-517-FC",
    etat: "EN CIRCULATION",
    proprietaire: "ACHAT",
    dateMiseEnCirculation: new Date("2017-02-22"),
    kilometrage: 220340,
    kmProchaineRevision: 180000,
    dateLimiteControleTechnique: new Date("2025-02-14"),
  },
  {
    id: "3",
    societe: "OT",
    marque: "PEUGEOT",
    modele: "PARTNER",
    immatriculation: "EQ-771-EP",
    etat: "EN CIRCULATION",
    proprietaire: "ACHAT",
    dateMiseEnCirculation: new Date("2017-08-31"),
    kilometrage: 182684,
    kmProchaineRevision: 109800,
    dateLimiteControleTechnique: new Date("2026-09-09"),
    dateLimiteControlePollution: new Date("2025-09-09"),
  },
  {
    id: "4",
    societe: "OT",
    marque: "DACIA",
    modele: "DUSTER",
    immatriculation: "FD-839-LL",
    etat: "EN CIRCULATION",
    proprietaire: "ACHAT",
    dateMiseEnCirculation: new Date("2019-01-29"),
    kilometrage: 143506,
    kmProchaineRevision: 94000,
    dateLimiteControleTechnique: new Date("2025-01-19"),
  },
  {
    id: "5",
    societe: "OT",
    marque: "PEUGEOT",
    modele: "PARTNER",
    immatriculation: "FE-209-YK",
    etat: "EN CIRCULATION",
    proprietaire: "ACHAT",
    dateMiseEnCirculation: new Date("2019-03-27"),
    kilometrage: 64000,
    kmProchaineRevision: 71000,
    dateLimiteControleTechnique: new Date("2026-07-18"),
    dateLimiteControlePollution: new Date("2025-08-18"),
  },
  {
    id: "6",
    societe: "OI",
    marque: "FIAT",
    modele: "DUCATO",
    immatriculation: "EN-529-XF",
    etat: "EN CIRCULATION",
    proprietaire: "ACHAT",
    dateMiseEnCirculation: new Date("2017-06-30"),
    kilometrage: 83539,
    dateLimiteControleTechnique: new Date("2025-07-01"),
  },
  {
    id: "7",
    societe: "OI",
    marque: "SIPREL",
    modele: "DEROULEUSE",
    immatriculation: "FD-774-JF",
    etat: "EN CIRCULATION",
    proprietaire: "ACHAT",
    dateMiseEnCirculation: new Date("2019-01-25"),
    typeVehicule: "REMORQUE",
  },
  {
    id: "8",
    societe: "OI",
    marque: "PEUGEOT",
    modele: "BOXER",
    immatriculation: "FH-570-MP",
    etat: "EN CIRCULATION",
    proprietaire: "ACHAT",
    dateMiseEnCirculation: new Date("2019-06-29"),
    kilometrage: 58699,
    kmProchaineRevision: 62700,
    dateLimiteControleTechnique: new Date("2025-07-03"),
  },
  {
    id: "9",
    societe: "OI",
    marque: "PEUGEOT",
    modele: "BOXER",
    immatriculation: "FJ-363-PG",
    etat: "EN CIRCULATION",
    proprietaire: "ACHAT",
    dateMiseEnCirculation: new Date("2019-08-21"),
    kilometrage: 73612,
    kmProchaineRevision: 90000,
    dateLimiteControleTechnique: new Date("2025-08-07"),
  },
  {
    id: "10",
    societe: "OI",
    marque: "SIPREL",
    modele: "DEROULEUSE",
    immatriculation: "FQ-958-GX",
    etat: "EN CIRCULATION",
    proprietaire: "ACHAT",
    dateMiseEnCirculation: new Date("2020-06-08"),
    typeVehicule: "REMORQUE",
  },
  {
    id: "11",
    societe: "OI",
    marque: "CITROEN",
    modele: "BERLINGO",
    immatriculation: "FT-181-PN",
    etat: "EN CIRCULATION",
    proprietaire: "ACHAT",
    dateMiseEnCirculation: new Date("2020-10-22"),
    kilometrage: 26019,
    kmProchaineRevision: 40000,
    dateLimiteControleTechnique: new Date("2024-10-22"),
    dateLimiteControlePollution: new Date("2024-10-22"),
  },
  {
    id: "12",
    societe: "OI",
    marque: "RENAULT",
    modele: "MASTER",
    immatriculation: "FW-258-FL",
    etat: "EN CIRCULATION",
    proprietaire: "ACHAT",
    dateMiseEnCirculation: new Date("2021-01-13"),
    kilometrage: 29798,
    kmProchaineRevision: 44000,
    dateLimiteControleTechnique: new Date("2025-01-13"),
    dateLimiteControlePollution: new Date("2025-01-13"),
  },
  {
    id: "13",
    societe: "OI",
    marque: "PEUGEOT",
    modele: "BOXER",
    immatriculation: "FY-498-HA",
    etat: "EN CIRCULATION",
    proprietaire: "CREDIT BAIL",
    dateMiseEnCirculation: new Date("2021-03-31"),
    kilometrage: 23071,
    kmProchaineRevision: 20000,
    dateLimiteControleTechnique: new Date("2025-03-31"),
    dateLimiteControlePollution: new Date("2025-03-31"),
  },
  {
    id: "14",
    societe: "OI",
    marque: "RENAULT",
    modele: "MASTER",
    immatriculation: "GB-110-HT",
    etat: "EN CIRCULATION",
    proprietaire: "LOCATION",
    dateMiseEnCirculation: new Date("2021-08-23"),
    kilometrage: 43384,
    dateLimiteControleTechnique: new Date("2025-08-23"),
    dateLimiteControlePollution: new Date("2025-08-23"),
  },
  {
    id: "15",
    societe: "OT",
    marque: "PEUGEOT",
    modele: "PARTNER",
    immatriculation: "GH-485-TD",
    etat: "EN CIRCULATION",
    proprietaire: "CREDIT BAIL",
    dateMiseEnCirculation: new Date("2022-07-28"),
    kilometrage: 500,
    kmProchaineRevision: 40000,
    dateLimiteControleTechnique: new Date("2026-07-28"),
    dateLimiteControlePollution: new Date("2026-07-28"),
  },
  {
    id: "16",
    societe: "OG",
    marque: "PEUGEOT",
    modele: "RIFTER",
    immatriculation: "FN-985-JY",
    etat: "EN CIRCULATION",
    proprietaire: "CREDIT BAIL",
    dateLimiteControleTechnique: new Date("2026-01-30"),
  },
  {
    id: "17",
    societe: "OT",
    marque: "PEUGEOT",
    modele: "208 STYLE",
    immatriculation: "GP-207-QF",
    etat: "EN CIRCULATION",
    proprietaire: "LEASING",
    dateMiseEnCirculation: new Date("2023-06-19"),
    dateLimiteControleTechnique: new Date("2027-06-19"),
  },
  {
    id: "18",
    societe: "OI",
    marque: "PEUGEOT",
    modele: "PARTNER",
    immatriculation: "GP-767-ZS",
    etat: "EN CIRCULATION",
    proprietaire: "CREDIT BAIL",
    dateMiseEnCirculation: new Date("2023-06-30"),
    dateLimiteControleTechnique: new Date("2027-06-30"),
  },
  {
    id: "19",
    societe: "OG",
    marque: "PEUGEOT",
    modele: "208",
    immatriculation: "GR-875-JT",
    etat: "EN CIRCULATION",
    proprietaire: "ACHAT",
    dateMiseEnCirculation: new Date("2023-09-25"),
    kilometrage: 11087,
    dateLimiteControleTechnique: new Date("2027-09-25"),
  },
  {
    id: "20",
    societe: "OI",
    marque: "PEUGEOT",
    modele: "PARTNER",
    immatriculation: "GP-706-ZS",
    etat: "EN CIRCULATION",
    proprietaire: "CREDIT BAIL",
    dateMiseEnCirculation: new Date("2023-06-30"),
    dateLimiteControleTechnique: new Date("2027-06-30"),
  },
  {
    id: "21",
    societe: "YE",
    marque: "PEUGEOT",
    modele: "PARTNER",
    immatriculation: "GS-995-RW",
    etat: "EN CIRCULATION",
    proprietaire: "ACHAT",
    dateMiseEnCirculation: new Date("2023-11-29"),
    dateLimiteControleTechnique: new Date("2027-11-29"),
    dateLimiteControlePollution: new Date("2027-11-29"),
  },
  {
    id: "22",
    societe: "OI",
    marque: "MAN",
    modele: "CAMION",
    immatriculation: "GJ-586-DM",
    etat: "EN CIRCULATION",
    proprietaire: "LOCATION",
  },
  {
    id: "23",
    societe: "YE",
    marque: "PEUGEOT",
    modele: "BOXER",
    immatriculation: "GV-903-BX",
    etat: "EN CIRCULATION",
    proprietaire: "ACHAT",
    dateMiseEnCirculation: new Date("2024-02-12"),
    dateLimiteControleTechnique: new Date("2028-02-12"),
  },
  {
    id: "24",
    societe: "OG",
    marque: "TESLA",
    modele: "MODEL Y",
    immatriculation: "GV-829-JK",
    etat: "EN CIRCULATION",
    proprietaire: "ACHAT",
  },
  {
    id: "25",
    societe: "YE",
    marque: "FIAT",
    modele: "DUCATO",
    immatriculation: "GY-201-XW",
    etat: "EN CIRCULATION",
    proprietaire: "ACHAT",
  },
  {
    id: "26",
    societe: "OI",
    marque: "ECIM",
    modele: "REMORQUE",
    immatriculation: "HC-539-FJ",
    etat: "EN CIRCULATION",
    proprietaire: "ACHAT",
    dateMiseEnCirculation: new Date("2025-03-03"),
    typeVehicule: "REMORQUE",
  },
  {
    id: "27",
    societe: "OI",
    marque: "RENAULT",
    modele: "MASTER",
    immatriculation: "CD-918-BN",
    etat: "EN CIRCULATION",
    proprietaire: "ACHAT",
  },
]
