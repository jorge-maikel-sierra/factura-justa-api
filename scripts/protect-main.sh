#!/usr/bin/env bash
set -euo pipefail

# Configuración
BRANCH="main"
OWNER_REPO="${GH_REPOSITORY:-}"

if [[ -z "$OWNER_REPO" ]]; then
  # Intenta derivar owner/repo desde git remote
  ORIGIN_URL=$(git config --get remote.origin.url || true)
  if [[ "$ORIGIN_URL" =~ github.com[:/](.+)/(.+)(\.git)?$ ]]; then
    OWNER_REPO="${BASH_REMATCH[1]}/${BASH_REMATCH[2]%.git}"
  else
    echo "No se pudo determinar owner/repo. Exporta GH_REPOSITORY=owner/repo o configura el remoto origin." >&2
    exit 1
  fi
fi

OWNER=${OWNER_REPO%%/*}
REPO=${OWNER_REPO##*/}

echo "Protegiendo ${OWNER}/${REPO} rama ${BRANCH}…"

require_gh() {
  command -v gh >/dev/null 2>&1
}

if require_gh; then
  echo "Usando gh CLI"
  gh api \
    -X PUT \
    "repos/${OWNER}/${REPO}/branches/${BRANCH}/protection" \
    -f required_status_checks.strict=true \
    -f required_status_checks.contexts[]='ci / lint' \
    -f required_status_checks.contexts[]='ci / typecheck' \
    -f required_status_checks.contexts[]='ci / test' \
    -f enforce_admins=true \
    -f required_pull_request_reviews.dismiss_stale_reviews=true \
    -f required_pull_request_reviews.required_approving_review_count=1 \
    -f required_pull_request_reviews.require_code_owner_reviews=true \
    -f required_linear_history=true \
    -f allow_force_pushes=false \
    -f allow_deletions=false \
    -f required_conversation_resolution=true >/dev/null

  # Firmas requeridas (opcional)
  if [[ "${REQUIRE_SIGNED_COMMITS:-false}" == "true" ]]; then
    gh api -X POST "repos/${OWNER}/${REPO}/branches/${BRANCH}/protection/required_signatures" >/dev/null || true
  fi
else
  echo "Usando curl + GH_TOKEN"
  : "${GH_TOKEN:?Debes exportar GH_TOKEN con permisos de admin en el repositorio}"
  API="https://api.github.com/repos/${OWNER}/${REPO}/branches/${BRANCH}/protection"
  DATA=$(cat <<JSON
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["ci / lint", "ci / typecheck", "ci / test"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "required_approving_review_count": 1,
    "require_code_owner_reviews": true
  },
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true
}
JSON
)
  curl -sfSL -X PUT "${API}" \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer ${GH_TOKEN}" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    -d "${DATA}" >/dev/null

  if [[ "${REQUIRE_SIGNED_COMMITS:-false}" == "true" ]]; then
    curl -sfSL -X POST \
      -H "Accept: application/vnd.github+json" \
      -H "Authorization: Bearer ${GH_TOKEN}" \
      -H "X-GitHub-Api-Version: 2022-11-28" \
      "https://api.github.com/repos/${OWNER}/${REPO}/branches/${BRANCH}/protection/required_signatures" >/dev/null || true
  fi
fi

echo "Regla de protección aplicada con éxito."
