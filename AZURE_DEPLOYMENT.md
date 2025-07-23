# Azure Static Web Apps Deployment Guide

## Steg 1: Skapa Azure Static Web App

1. **Logga in på Azure Portal** (portal.azure.com)
2. **Skapa ny resurs** → Sök på "Static Web Apps"
3. **Konfigurera:**
   - **Subscription:** Team8:s Azure-prenumeration
   - **Resource Group:** Skapa ny eller använd befintlig
   - **Name:** `scantovitec-dashboard` (eller liknande)
   - **Plan type:** Free (räcker för detta projekt)
   - **Region:** West Europe (närmast Sverige)

4. **GitHub-integration:**
   - **Source:** GitHub
   - **GitHub account:** PatrikFernbergTeam8
   - **Repository:** scantovitec
   - **Branch:** main
   - **Build Presets:** React
   - **App location:** `/`
   - **Api location:** `api`
   - **Output location:** `dist`

5. **Klicka "Review + create"** → **Create**

## Steg 2: Konfigurera GitHub Secrets

Azure kommer automatiskt att lägga till en secret i GitHub-repot:
- `AZURE_STATIC_WEB_APPS_API_TOKEN` (läggs till automatiskt)

## Steg 3: Deploy

1. **Push till main branch** (detta utlöser automatisk deployment)
2. **Vänta på GitHub Actions** att bygga och deploya
3. **Få URL** från Azure Portal (t.ex. `https://scantovitec-dashboard.azurestaticapps.net`)

## Steg 4: Testa med PLAYipp

1. **Uppdatera PLAYipp** att använda den nya Azure-URL:en
2. **Testa på PLAYipp-enhet** - ska nu fungera!

## Steg 5: (Valfritt) Egen domän

Om ni vill använda egen Team8-domän:
1. **Gå till Static Web App** i Azure Portal
2. **Custom domains** → **Add**
3. **Lägg till:** `dashboard.team8.se` (eller annan domän)
4. **Konfigurera DNS** enligt Azures instruktioner

## Kostnader

- **Static Web Apps (Free tier):**
  - 100 GB bandbredd/månad
  - 0.5 GB storage
  - Gratis API calls
  - **Kostnad: 0 kr/månad**

## Troubleshooting

- **GitHub Actions fails:** Kontrollera att build-kommandot är korrekt
- **API inte tillgängligt:** Verifiera att api-mappen finns
- **CORS-problem:** Azure Static Web Apps hanterar CORS automatiskt