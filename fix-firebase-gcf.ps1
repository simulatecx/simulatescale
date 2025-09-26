# =================================================================
# Fix Firebase Gen 2 Cloud Functions Deployment Environment
#
# This script automates the following fixes:
# 1. Installs required gcloud components (beta).
# 2. Configures gcloud CLI with project and region defaults.
# 3. Enables all necessary Google Cloud APIs.
# 4. Creates service account identities to ensure they exist.
# 5. Grants the correct IAM roles to those service accounts.
# 6. Ensures the required Cloud Storage bucket for function sources exists.
#
# HOW TO RUN:
# 1. Open PowerShell as an Administrator.
# 2. Navigate to the directory where you saved this script.
# 3. Run the command: ./fix-firebase-gcf.ps1
# =================================================================

# --- Script Configuration ---
$PROJECT_ID = "simulatescale"
$PROJECT_NUMBER = "735964366465"
$REGION = "us-central1"
$ZONE = "us-central1-a" # A default zone within the chosen region.

# --- Main Script ---

Write-Host "Starting environment fix for Google Cloud project: $PROJECT_ID" -ForegroundColor Cyan

# --- 1. Install gcloud Beta Components ---
Write-Host "`n[Step 1/6] Checking for and installing gcloud beta components..." -ForegroundColor Yellow
gcloud components install beta -q
Write-Host "gcloud components are up to date." -ForegroundColor Green

# --- 2. Configure gcloud CLI Defaults ---
Write-Host "`n[Step 2/6] Configuring gcloud CLI defaults..." -ForegroundColor Yellow
Write-Host "  - Setting default project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID
Write-Host "  - Setting default compute region to $REGION..."
gcloud config set compute/region $REGION
Write-Host "  - Setting default compute zone to $ZONE..."
gcloud config set compute/zone $ZONE
Write-Host "gcloud CLI configured." -ForegroundColor Green

# --- 3. Enable Required APIs ---
Write-Host "`n[Step 3/6] Enabling required Google Cloud APIs..." -ForegroundColor Yellow
$apis = @(
    "iam.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "cloudfunctions.googleapis.com",
    "cloudbuild.googleapis.com",
    "artifactregistry.googleapis.com",
    "run.googleapis.com",
    "storage.googleapis.com",
    "eventarc.googleapis.com",
    "pubsub.googleapis.com",
    "identitytoolkit.googleapis.com"
)

foreach ($api in $apis) {
    Write-Host "  - Enabling $api..."
    gcloud services enable $api --project=$PROJECT_ID --quiet
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  - Failed to enable $api. Please check your gcloud permissions and try again." -ForegroundColor Red
        exit 1
    }
}
Write-Host "All required APIs are enabled." -ForegroundColor Green

# --- 4. Create Service Identities (Ensures Service Accounts Exist) ---
Write-Host "`n[Step 4/6] Ensuring service identities exist..." -ForegroundColor Yellow
gcloud beta services identity create --service=pubsub.googleapis.com --project=$PROJECT_ID | Out-Null
gcloud beta services identity create --service=eventarc.googleapis.com --project=$PROJECT_ID | Out-Null
Write-Host "Service identities are configured." -ForegroundColor Green
Write-Host "Waiting 15 seconds for IAM changes to propagate..."
Start-Sleep -Seconds 15


# --- 5. Grant Correct IAM Roles ---
Write-Host "`n[Step 5/6] Granting required IAM roles to service accounts..." -ForegroundColor Yellow

# Define service accounts and the roles they need
$serviceAccounts = @(
    @{
        Member = "serviceAccount:service-$PROJECT_NUMBER@gcf-admin-robot.iam.gserviceaccount.com"
        Role   = "roles/cloudfunctions.serviceAgent"
        Name   = "Cloud Functions Service Agent"
    },
    @{
        Member = "serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com"
        Role   = "roles/editor"
        Name   = "Compute Engine Default Service Account"
    },
    @{
        Member = "serviceAccount:service-$PROJECT_NUMBER@gcp-sa-pubsub.iam.gserviceaccount.com"
        Role   = "roles/pubsub.serviceAgent"
        Name   = "Pub/Sub Service Agent"
    },
    @{
        Member = "serviceAccount:service-$PROJECT_NUMBER@gcp-sa-eventarc.iam.gserviceaccount.com"
        Role   = "roles/eventarc.serviceAgent"
        Name   = "Eventarc Service Agent"
    },
    @{
        Member = "serviceAccount:service-$PROJECT_NUMBER@gcp-sa-artifactregistry.iam.gserviceaccount.com"
        Role   = "roles/artifactregistry.serviceAgent"
        Name   = "Artifact Registry Service Agent"
    },
    @{
        Member = "serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com"
        Role   = "roles/cloudfunctions.admin"
        Name   = "Cloud Build Service Account (Cloud Functions Admin)"
    },
    @{
        Member = "serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com"
        Role   = "roles/iam.serviceAccountUser"
        Name   = "Cloud Build Service Account (Service Account User)"
    }
)

foreach ($sa in $serviceAccounts) {
    Write-Host "  - Granting '$($sa.Role)' to '$($sa.Name)'..."
    # Use --quiet to suppress unnecessary output on success
    gcloud projects add-iam-policy-binding $PROJECT_ID --member="$($sa.Member)" --role="$($sa.Role)" --condition=None --quiet
    if ($LASTEXITCODE -ne 0) {
        Write-Host "    ERROR: Failed to grant role $($sa.Role). This is likely due to an organization security policy." -ForegroundColor Red
        Write-Host "    Please contact your Google Cloud administrator for assistance." -ForegroundColor Red
    }
}
Write-Host "IAM roles have been configured." -ForegroundColor Green


# --- 6. Verify or Create Cloud Storage Bucket ---
Write-Host "`n[Step 6/6] Verifying Cloud Storage bucket for function sources..." -ForegroundColor Yellow
$BUCKET = "gcf-sources-$PROJECT_NUMBER-$REGION"
Write-Host "  - Checking for bucket: $BUCKET"

gcloud storage buckets describe "gs://$BUCKET" --project $PROJECT_ID --quiet 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "  - Bucket '$BUCKET' already exists." -ForegroundColor Green
}
else {
    Write-Host "  - Bucket '$BUCKET' is missing. Creating it now..."
    gcloud storage buckets create "gs://$BUCKET" --project=$PROJECT_ID --location=$REGION --uniform-bucket-level-access
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  - Bucket '$BUCKET' created successfully." -ForegroundColor Green
    }
    else {
        Write-Host "  - Failed to create bucket '$BUCKET'. Please check permissions or create it manually in the Google Cloud Console." -ForegroundColor Red
        exit 1
    }
}

# --- Completion ---
Write-Host "`n================================================================" -ForegroundColor Cyan
Write-Host "Environment fix complete!" -ForegroundColor Green
Write-Host "You can now try deploying your functions again."
Write-Host "Run this command from your 'functions' directory:" -ForegroundColor Yellow
Write-Host "   firebase deploy --only functions"
Write-Host "================================================================" -ForegroundColor Cyan

