# venv_setup.ps1 - create a .venv, install pip requirements
param(
    [string]$PythonExe = "python"
)

Write-Host "Creating virtual environment at .venv..."
$PythonExe -m venv .venv

Write-Host "Activating virtual environment and upgrading pip..."
if (Test-Path .venv/Scripts/Activate.ps1) {
    & .venv/Scripts/Activate.ps1
}

. .venv/Scripts/Activate.ps1

Write-Host "Upgrading pip and installing wheel..."
python -m pip install --upgrade pip setuptools wheel

Write-Host "Installing requirements from root requirements.txt"
python -m pip install -r requirements.txt

Write-Host "Done. To activate the venv in PowerShell run: . .venv/Scripts/Activate.ps1"
