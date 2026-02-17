const REPO_OWNER = 'ManyConnection'
const REPO_NAME = 'app-dashboard'
const FILE_PATH = 'apps.json'

export async function getAppsFromGitHub(token: string): Promise<{ content: string; sha: string } | null> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
        cache: 'no-store',
      }
    )
    
    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error(`GitHub API error: ${response.status}`)
    }
    
    const data = await response.json()
    const content = atob(data.content)
    return { content, sha: data.sha }
  } catch (error) {
    console.error('Failed to fetch from GitHub:', error)
    return null
  }
}

export async function saveAppsToGitHub(
  token: string,
  content: string,
  sha: string | null,
  message: string
): Promise<boolean> {
  try {
    const body: Record<string, unknown> = {
      message,
      content: btoa(unescape(encodeURIComponent(content))),
    }
    
    if (sha) {
      body.sha = sha
    }
    
    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    )
    
    if (!response.ok) {
      const error = await response.text()
      console.error('Failed to save to GitHub:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Failed to save to GitHub:', error)
    return false
  }
}
