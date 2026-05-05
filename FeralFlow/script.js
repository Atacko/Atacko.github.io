class E621Feed {
  constructor() {
    this.currentPage = 1
    this.currentTags = "female"
    this.isLoading = false
    this.posts = []
    this.seenIds = new Set()
    this.observer = null

    this.currentView = "feed"
    this.isAuthenticated = false
    this.username = null
    this.apiKey = null
    this.userBlacklist = []
    this.userFavorites = new Set()

    this.init()
  }

  // ─── Init ──────────────────────────────────────────────────────────────────

  init() {
    this.setupEventListeners()
    this.setupInfiniteScroll()
    this.checkSavedAuth()
    this.loadPosts(true)
  }

  // ─── Auth ──────────────────────────────────────────────────────────────────

  checkSavedAuth() {
    try {
      const saved = localStorage.getItem("e621_auth")
      if (!saved) return
      const { username, apiKey } = JSON.parse(saved)
      if (username && apiKey) {
        this.username = username
        this.apiKey = apiKey
        this.isAuthenticated = true
        this.loadUserBlacklist()
        this.loadUserFavorites()
      }
    } catch {
      localStorage.removeItem("e621_auth")
    }
  }

  saveAuth(username, apiKey) {
    this.username = username
    this.apiKey = apiKey
    this.isAuthenticated = true
    localStorage.setItem("e621_auth", JSON.stringify({ username, apiKey }))
    this.loadUserBlacklist()
    this.loadUserFavorites()
  }

  logout() {
    this.username = null
    this.apiKey = null
    this.isAuthenticated = false
    this.userBlacklist = []
    this.userFavorites.clear()
    localStorage.removeItem("e621_auth")
    this.showFeed()
  }

  // ─── Blacklist ─────────────────────────────────────────────────────────────

  loadUserBlacklist() {
    if (!this.username) return
    try {
      const saved = localStorage.getItem(`e621_blacklist_${this.username}`)
      if (saved) {
        const data = JSON.parse(saved)
        this.userBlacklist = data.tags || []
      }
    } catch {
      this.userBlacklist = []
    }
  }

  saveUserBlacklist() {
    if (!this.username) return
    localStorage.setItem(
      `e621_blacklist_${this.username}`,
      JSON.stringify({ tags: this.userBlacklist, updated: Date.now() })
    )
  }

  updateBlacklist(text) {
    this.userBlacklist = (text || "")
      .split(/[\n\r]+/)
      .map((l) => l.trim().toLowerCase())
      .filter((l) => l && !l.startsWith("#"))
    this.saveUserBlacklist()
    // Hide any currently rendered posts that now match
    document.querySelectorAll(".post").forEach((el) => {
      const post = this.posts.find((p) => p.id.toString() === el.dataset.postId)
      if (post && this.isBlacklisted(post)) el.style.display = "none"
    })
  }

  isBlacklisted(post) {
    if (!this.userBlacklist.length) return false
    const tags = [
      ...(post.tags.general || []),
      ...(post.tags.species || []),
      ...(post.tags.character || []),
      ...(post.tags.artist || []),
      ...(post.tags.copyright || []),
      ...(post.tags.meta || []),
    ].map((t) => t.toLowerCase())
    return this.userBlacklist.some((bl) => tags.includes(bl))
  }

  // ─── Favorites ─────────────────────────────────────────────────────────────

  loadUserFavorites() {
    if (!this.username) return
    try {
      const saved = localStorage.getItem(`e621_favorites_${this.username}`)
      if (saved) {
        const data = JSON.parse(saved)
        this.userFavorites = new Set(data.favorites || [])
        this.syncLikeStates()
      }
    } catch {
      this.userFavorites = new Set()
    }
  }

  saveFavorites() {
    if (!this.username) return
    localStorage.setItem(
      `e621_favorites_${this.username}`,
      JSON.stringify({ favorites: [...this.userFavorites], updated: Date.now() })
    )
  }

  syncLikeStates() {
    document.querySelectorAll('.engagement-item[data-type="like"]').forEach((btn) => {
      const postId = btn.dataset.postId
      btn.classList.toggle("liked", this.userFavorites.has(postId))
    })
  }

  async addToFavorites(postId) {
    if (!this.isAuthenticated) return false
    try {
      const body = new URLSearchParams({ post_id: postId })
      const res = await fetch("https://e621.net/favorites.json", {
        method: "POST",
        headers: {
          "User-Agent": `E621Feed/2.0 (by ${this.username} on e621)`,
          Authorization: "Basic " + btoa(`${this.username}:${this.apiKey}`),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      })
      if (res.status === 401) { this.logout(); return false }
      return true // 200 or 422 (already fav'd) both count as success
    } catch {
      return false
    }
  }

  async removeFromFavorites(postId) {
    if (!this.isAuthenticated) return false
    try {
      const res = await fetch(`https://e621.net/favorites/${postId}.json`, {
        method: "DELETE",
        headers: {
          "User-Agent": `E621Feed/2.0 (by ${this.username} on e621)`,
          Authorization: "Basic " + btoa(`${this.username}:${this.apiKey}`),
        },
      })
      if (res.status === 401) { this.logout(); return false }
      return true
    } catch {
      return false
    }
  }

  // ─── API Fetch ─────────────────────────────────────────────────────────────
  // cancelSearch() must be called before every new feed fetch so in-flight
  // requests are dropped immediately, never resolving into the wrong state.

  cancelSearch() {
    this._searchCtrl?.abort()
    this._searchCtrl = new AbortController()
    return this._searchCtrl.signal
  }

  async fetchE621Posts(tags, page) {
    // Grab a fresh signal — cancels any previous in-flight feed request
    const signal = this.cancelSearch()

    const params = new URLSearchParams({ tags: tags || "female", limit: 20, page })
    const targetUrl = `https://e621.net/posts.json?${params}`

    // Try each proxy in order; move to the next on failure.
    // allorigins wraps the response in { contents: "..." }, codetabs returns raw JSON.
    const proxies = [
      {
        url: `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`,
        parse: async (res) => {
          const w = await res.json()
          return JSON.parse(w.contents)
        },
      },
      {
        url: `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`,
        parse: async (res) => res.json(),
      },
    ]

    for (const proxy of proxies) {
      // Skip if this search was already superseded
      if (signal.aborted) return []

      try {
        const timeoutCtrl = new AbortController()
        const tid = setTimeout(() => timeoutCtrl.abort(), 12000)

        // Merge proxy abort + search-cancel signal
        const combo = AbortSignal.any
          ? AbortSignal.any([signal, timeoutCtrl.signal])
          : timeoutCtrl.signal   // fallback for older browsers

        const res = await fetch(proxy.url, { signal: combo })
        clearTimeout(tid)

        if (!res.ok) continue

        const json = await proxy.parse(res)
        if (!json?.posts) continue

        return this.normalizePosts(json.posts)
      } catch (err) {
        if (err.name === 'AbortError' && signal.aborted) return []
        // proxy failed — try next
      }
    }

    throw new Error("All proxies failed. Please check your connection and try again.")
  }

  // Simple timed fetch for non-feed requests (auth checks etc.)
  timedFetch(url, opts = {}, ms = 10000) {
    const ctrl = new AbortController()
    const id = setTimeout(() => ctrl.abort(), ms)
    return fetch(url, { ...opts, signal: ctrl.signal }).finally(() => clearTimeout(id))
  }

  normalizePosts(raw) {
    return raw
      .filter((p) => p.file?.url) // drop deleted/unavailable posts
      .map((p) => ({
        id: p.id,
        file: { url: p.file.url, ext: p.file.ext || "jpg" },
        preview: { url: p.preview?.url },
        tags: {
          general: p.tags?.general || [],
          species: p.tags?.species || [],
          character: p.tags?.character || [],
          artist: p.tags?.artist || [],
          copyright: p.tags?.copyright || [],
          meta: p.tags?.meta || [],
        },
        score: { up: p.score?.up || 0, down: p.score?.down || 0, total: p.score?.total || 0 },
        fav_count: p.fav_count || 0,
        comment_count: p.comment_count || 0,
        created_at: p.created_at,
        rating: p.rating || "s",
        description: p.description || "",
        uploader_name: p.uploader_name || "Anonymous",
      }))
  }

  // ─── Loading / Rendering ───────────────────────────────────────────────────

  async loadPosts(reset = false) {
    if (reset) {
      // Cancel any in-flight request immediately, don't wait for isLoading
      this.cancelSearch()
      this.isLoading = false
    }
    if (this.isLoading) return
    this.isLoading = true

    if (reset) {
      this.currentPage = 1
      this.posts = []
      this.seenIds.clear()
      document.getElementById("feed").innerHTML =
        '<div class="loading-indicator" id="loadingIndicator"><div class="spinner"></div><p>Loading posts…</p></div>'
    } else {
      this.showLoadingMore()
    }

    try {
      const fresh = await this.fetchE621Posts(this.currentTags, this.currentPage)

      // Deduplicate — prevents duplicate cards on repeat pages
      const newPosts = fresh.filter((p) => {
        if (this.seenIds.has(p.id)) return false
        this.seenIds.add(p.id)
        return true
      })

      // Filter blacklist
      const visible = newPosts.filter((p) => !this.isBlacklisted(p))

      this.posts.push(...newPosts)
      this.appendPosts(visible, reset)

      if (fresh.length === 0) {
        this.currentPage = 1
        this.seenIds.clear()
      } else {
        this.currentPage++
      }
    } catch (err) {
      if (err.name !== 'AbortError') this.showError(err.message)
    } finally {
      this.isLoading = false
      this.hideLoadingMore()
    }
  }

  appendPosts(posts, isReset) {
    const feed = document.getElementById("feed")

    if (isReset) feed.innerHTML = ""

    const frag = document.createDocumentFragment()
    posts.forEach((post, i) => {
      const el = this.createPostElement(post)
      el.style.animationDelay = `${Math.min(i * 0.04, 0.3)}s`
      el.classList.add("post-enter")
      frag.appendChild(el)
    })
    feed.appendChild(frag)

    let trigger = document.getElementById("loadMoreTrigger")
    if (!trigger) {
      trigger = document.createElement("div")
      trigger.id = "loadMoreTrigger"
      trigger.className = "load-more-trigger"
    }
    feed.appendChild(trigger)
    this.observer?.observe(trigger)

    if (this.isAuthenticated) this.syncLikeStates()
  }

  createPostElement(post) {
    const el = document.createElement("div")
    el.className = "post"
    el.dataset.postId = post.id

    const tags = [
      ...post.tags.general.slice(0, 4),
      ...post.tags.species.slice(0, 2),
      ...post.tags.character.slice(0, 2),
    ].slice(0, 8)

    const artistName = post.tags.artist[0]?.replace(/_/g, " ") || `Artist_${post.id}`
    const timeAgo = this.getTimeAgo(post.created_at)
    const rating = { s: "Safe", q: "Questionable", e: "Explicit" }[post.rating] || "Safe"
    const isVideo = post.file.ext === "webm" || post.file.ext === "mp4"

    const media = isVideo
      ? `<video src="${post.file.url}" class="post-image" controls loop muted preload="metadata" playsinline></video>`
      : `<img
           src="${post.file.url}"
           alt="Post #${post.id}"
           class="post-image"
           loading="lazy"
           decoding="async"
         >`

    const postText = post.description?.trim() || `Post #${post.id}`
    const tagLinks = tags
      .map(
        (t) =>
          `<a href="#" class="tag" data-tag="${t}">#${t.replace(/_/g, " ")}</a>`
      )
      .join("")

    el.innerHTML = `
      <div class="post-header">
        <div class="profile-pic">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
        <div class="post-info">
          <div class="user-info">
            <span class="username">${this.esc(artistName)}</span>
            <span class="user-handle">@${this.esc(artistName.toLowerCase().replace(/\s+/g, ""))}</span>
            <span class="post-time">${timeAgo}</span>
          </div>
        </div>
      </div>

      <div class="post-content">
        <div class="post-text">${this.esc(postText).slice(0, 280)}</div>
        <div class="post-tags">${tagLinks}</div>
        <div class="post-media">
          ${media}
          <div class="image-overlay"><span class="rating-badge">${rating}</span></div>
        </div>
      </div>

      <div class="engagement-bar">
        <div class="engagement-item" data-type="reply">
          <svg class="engagement-icon" viewBox="0 0 24 24"><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"/></svg>
          <span>${post.comment_count}</span>
        </div>
        <div class="engagement-item" data-type="retweet">
          <svg class="engagement-icon" viewBox="0 0 24 24"><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46L18.5 16.45V8c0-1.1-.896-2-2-2z"/></svg>
          <span>${Math.max(0, Math.floor(post.score.total * 0.1))}</span>
        </div>
        <div class="engagement-item" data-type="like" data-post-id="${post.id}">
          <svg class="engagement-icon" viewBox="0 0 24 24"><path d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.645-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12zM7.354 4.225c-2.08 0-3.903 1.988-3.903 4.255 0 5.74 7.034 11.596 8.55 11.658 1.518-.062 8.55-5.917 8.55-11.658 0-2.267-1.823-4.255-3.903-4.255-2.528 0-3.94 2.936-3.952 2.965-.23.562-1.156.562-1.387 0-.014-.03-1.425-2.965-3.955-2.965z"/></svg>
          <span>${post.fav_count}</span>
        </div>
        <div class="engagement-item" data-type="views">
          <svg class="engagement-icon" viewBox="0 0 24 24"><path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10H6v10H4zm9.248 0v-7h2v7h-2z"/></svg>
          <span>${this.fmt((post.score.up || 0) * 10)}</span>
        </div>
        <div class="engagement-item" data-type="share" data-post-id="${post.id}">
          <svg class="engagement-icon" viewBox="0 0 24 24"><path d="M17.53 7.47l-5-5c-.293-.293-.768-.293-1.06 0l-5 5c-.294.293-.294.768 0 1.06s.767.294 1.06 0L11 5.06V15c0 .553.447 1 1 1s1-.447 1-1V5.06l3.47 3.47c.293.293.767.293 1.06 0s.293-.767 0-1.06zM19.708 21.944H4.292C3.028 21.944 2 20.916 2 19.652V14c0-.553.447-1 1-1s1 .447 1 1v5.652c0 .437.377.792.708.792h15.584c.331 0 .708-.355.708-.792V14c0-.553.447-1 1-1s1 .447 1 1v5.652c0 1.264-1.028 2.292-2.292 2.292z"/></svg>
        </div>
      </div>
    `

    return el
  }

  // ─── Infinite Scroll ───────────────────────────────────────────────────────

  setupInfiniteScroll() {
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !this.isLoading) {
          this.loadPosts(false)
        }
      },
      { rootMargin: "200px" }
    )
  }

  // ─── Event Listeners ───────────────────────────────────────────────────────

  setupEventListeners() {
    const input = document.getElementById("searchInput")
    const btn = document.getElementById("searchBtn")

    const doSearch = () => {
      const tags = input.value.trim()
      if (tags === this.currentTags && this.currentView === "feed") return
      this.currentTags = tags || "female"
      this.showFeed()
      this.loadPosts(true)
    }

    btn.addEventListener("click", doSearch)
    input.addEventListener("keydown", (e) => e.key === "Enter" && doSearch())

    document.querySelectorAll(".nav-btn").forEach((b) =>
      b.addEventListener("click", (e) => this.handleNavigation(e))
    )

    // Single delegated listener for the whole feed
    document.getElementById("feed").addEventListener("click", (e) => {
      const tag = e.target.closest(".tag")
      if (tag) {
        e.preventDefault()
        const t = tag.dataset.tag
        document.getElementById("searchInput").value = t
        this.currentTags = t
        this.loadPosts(true)
        return
      }

      const engagement = e.target.closest(".engagement-item")
      if (engagement) { this.handleEngagement(engagement); return }

      const img = e.target.closest(".post-image")
      if (img && img.tagName === "IMG") { this.openFullscreen(img); return }
    })
  }

  // ─── Engagement ───────────────────────────────────────────────────────────

  async handleEngagement(item) {
    const type = item.dataset.type
    const span = item.querySelector("span")
    const count = parseInt(span?.textContent?.replace(/[KM]/, "") || "0") || 0

    switch (type) {
      case "like":
        await this.toggleLike(item, span, count)
        break
      case "retweet":
        item.classList.toggle("retweeted")
        if (span) span.textContent = this.fmt(item.classList.contains("retweeted") ? count + 1 : count - 1)
        break
      case "share":
        this.handleShare(item)
        break
    }
  }

  async toggleLike(item, span, count) {
    if (!this.isAuthenticated) {
      this.showLogin()
      return
    }

    const postId = item.dataset.postId
    const isLiked = item.classList.contains("liked")

    item.classList.toggle("liked")
    if (span) span.textContent = this.fmt(isLiked ? count - 1 : count + 1)

    const ok = isLiked ? await this.removeFromFavorites(postId) : await this.addToFavorites(postId)

    if (!ok) {
      item.classList.toggle("liked")
      if (span) span.textContent = this.fmt(count)
      return
    }

    if (isLiked) {
      this.userFavorites.delete(postId)
    } else {
      this.userFavorites.add(postId)
      this.heartBurst(item)
    }
    this.saveFavorites()
  }

  handleShare(item) {
    const postId = item.dataset.postId
    const url = `https://e621.net/posts/${postId}`
    if (navigator.share) {
      navigator.share({ title: "e621 Post", url })
    } else {
      navigator.clipboard?.writeText(url).then(() => {
        item.style.color = "var(--accent-green)"
        setTimeout(() => (item.style.color = ""), 1200)
      })
    }
  }

  heartBurst(element) {
    const rect = element.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    for (let i = 0; i < 6; i++) {
      const h = document.createElement("div")
      h.textContent = "♥"
      h.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;color:#f91880;font-size:12px;pointer-events:none;z-index:9999;transition:all .6s ease-out;`
      document.body.appendChild(h)
      requestAnimationFrame(() => {
        const angle = (i * 60 * Math.PI) / 180
        const d = 30 + Math.random() * 20
        h.style.transform = `translate(${Math.cos(angle) * d}px,${Math.sin(angle) * d}px)`
        h.style.opacity = "0"
      })
      setTimeout(() => h.remove(), 650)
    }
  }

  // ─── Fullscreen ────────────────────────────────────────────────────────────

  openFullscreen(img) {
    const modal = document.createElement("div")
    modal.className = "fullscreen-modal"

    const full = document.createElement("img")
    full.className = "fullscreen-image"
    full.src = img.dataset.full || img.src
    full.alt = img.alt

    const closeBtn = document.createElement("button")
    closeBtn.className = "fullscreen-close"
    closeBtn.textContent = "×"

    modal.append(full, closeBtn)
    document.body.appendChild(modal)

    const close = () => modal.remove()
    closeBtn.addEventListener("click", (e) => { e.stopPropagation(); close() })
    modal.addEventListener("click", (e) => { if (e.target === modal) close() })

    const onKey = (e) => { if (e.key === "Escape") { close(); document.removeEventListener("keydown", onKey) } }
    document.addEventListener("keydown", onKey)
    modal.addEventListener("remove", () => document.removeEventListener("keydown", onKey))
  }

  // ─── Navigation ────────────────────────────────────────────────────────────

  handleNavigation(e) {
    document.querySelectorAll(".nav-btn").forEach((b) => b.classList.remove("active"))
    e.currentTarget.classList.add("active")
    const nav = e.currentTarget.dataset.nav
    if (nav === "profile") {
      this.isAuthenticated ? this.showProfile() : this.showLogin()
    } else {
      this.currentTags = "female"
      document.getElementById("searchInput").value = ""
      this.showFeed()
      this.loadPosts(true)
    }
  }

  showFeed() {
    this.currentView = "feed"
    document.querySelector(".app-container")
      .querySelectorAll(".login-form, .profile-section")
      .forEach((el) => el.remove())
    document.getElementById("feed").style.display = ""
    document.querySelector('.nav-btn[data-nav="home"]').classList.add("active")
    document.querySelector('.nav-btn[data-nav="profile"]').classList.remove("active")
  }

  showLogin() {
    this.currentView = "login"
    document.getElementById("feed").style.display = "none"
    document.querySelector(".app-container")
      .querySelectorAll(".login-form, .profile-section")
      .forEach((el) => el.remove())

    const div = document.createElement("div")
    div.className = "login-form"
    div.innerHTML = `
      <div class="login-container">
        <h2>Login to e621</h2>
        <p>Enter your username and API key to enable favorites and blacklist syncing.</p>
        <div class="form-group">
          <label>Username</label>
          <input type="text" id="loginUser" autocomplete="username">
        </div>
        <div class="form-group">
          <label>API Key</label>
          <input type="password" id="loginKey" autocomplete="current-password">
          <small>Find your API key in <a href="https://e621.net/users/settings" target="_blank">Account Settings</a></small>
        </div>
        <div id="loginError" style="color:var(--accent-red);font-size:13px;margin-bottom:12px;display:none;"></div>
        <button id="loginSubmit" class="profile-btn">Login</button>
        <button id="loginCancel" class="profile-btn secondary" style="margin-top:8px">Cancel</button>
      </div>
    `
    document.querySelector(".app-container").appendChild(div)

    document.getElementById("loginSubmit").addEventListener("click", async () => {
      const username = document.getElementById("loginUser").value.trim()
      const apiKey = document.getElementById("loginKey").value.trim()
      const errEl = document.getElementById("loginError")
      const btn = document.getElementById("loginSubmit")

      if (!username || !apiKey) { errEl.textContent = "Both fields are required."; errEl.style.display = ""; return }

      btn.textContent = "Logging in…"
      btn.disabled = true
      errEl.style.display = "none"

      const ok = await this.authenticateUser(username, apiKey)
      if (ok) {
        this.showProfile()
      } else {
        errEl.textContent = "Login failed — check your username and API key."
        errEl.style.display = ""
        btn.textContent = "Login"
        btn.disabled = false
      }
    })

    document.getElementById("loginCancel").addEventListener("click", () => this.showFeed())
  }

  async authenticateUser(username, apiKey) {
    try {
      const res = await this.timedFetch(`https://e621.net/users/${username}.json`, {
        headers: {
          "User-Agent": `E621Feed/2.0 (by ${username} on e621)`,
          Authorization: "Basic " + btoa(`${username}:${apiKey}`),
        },
      }, 8000)
      if (res.status === 401) return false
      this.saveAuth(username, apiKey)
      return true
    } catch {
      this.saveAuth(username, apiKey)
      return true
    }
  }

  showProfile() {
    this.currentView = "profile"
    document.getElementById("feed").style.display = "none"
    document.querySelector(".app-container")
      .querySelectorAll(".login-form, .profile-section")
      .forEach((el) => el.remove())

    const div = document.createElement("div")
    div.className = "profile-section"
    div.innerHTML = `
      <div class="profile-container">
        <h2>Profile</h2>
        <div class="profile-info">
          <p><strong>Username:</strong> ${this.esc(this.username)}</p>
          <p><strong>Status:</strong> Logged in</p>
          <p><strong>Blacklist:</strong> <span id="blCount">${this.userBlacklist.length}</span> tags</p>
        </div>

        <div class="blacklist-section">
          <h3>Manage Blacklist</h3>
          <p>One tag per line — these posts will be hidden from your feed.</p>
          <textarea id="blacklistInput" rows="8">${this.esc(this.userBlacklist.join("\n"))}</textarea>
          <div class="blacklist-actions">
            <button id="saveBlacklist" class="profile-btn">Save</button>
            <button id="clearBlacklist" class="profile-btn secondary">Clear All</button>
          </div>
        </div>

        <div class="profile-actions">
          <button id="viewE621Profile" class="profile-btn">View e621 Profile</button>
          <button id="logoutBtn" class="profile-btn" style="background:var(--accent-red)">Logout</button>
          <button id="backToFeed" class="profile-btn secondary">Back to Feed</button>
        </div>
      </div>
    `
    document.querySelector(".app-container").appendChild(div)

    document.getElementById("saveBlacklist").addEventListener("click", () => {
      this.updateBlacklist(document.getElementById("blacklistInput").value)
      document.getElementById("blCount").textContent = this.userBlacklist.length
    })
    document.getElementById("clearBlacklist").addEventListener("click", () => {
      document.getElementById("blacklistInput").value = ""
      this.updateBlacklist("")
      document.getElementById("blCount").textContent = 0
    })
    document.getElementById("viewE621Profile").addEventListener("click", () =>
      window.open(`https://e621.net/users/${this.username}`, "_blank")
    )
    document.getElementById("logoutBtn").addEventListener("click", () => this.logout())
    document.getElementById("backToFeed").addEventListener("click", () => this.showFeed())
  }

  // ─── Loading indicators ────────────────────────────────────────────────────

  showLoadingMore() {
    if (document.getElementById("loadingMore")) return
    const el = document.createElement("div")
    el.id = "loadingMore"
    el.className = "loading-indicator"
    el.innerHTML = '<div class="spinner"></div><p>Loading more…</p>'
    document.getElementById("feed").appendChild(el)
  }

  hideLoadingMore() {
    document.getElementById("loadingMore")?.remove()
  }

  showError(message) {
    document.getElementById("feed").innerHTML = `
      <div class="error-message">
        <p>⚠️ ${this.esc(message)}</p>
        <button class="retry-btn" onclick="location.reload()">Retry</button>
      </div>
    `
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  esc(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
  }

  fmt(n) {
    n = Number(n) || 0
    if (n >= 1e6) return (n / 1e6).toFixed(1) + "M"
    if (n >= 1e3) return (n / 1e3).toFixed(1) + "K"
    return String(n)
  }

  getTimeAgo(dateStr) {
    const s = Math.floor((Date.now() - new Date(dateStr)) / 1000)
    if (s < 60) return `${s}s`
    if (s < 3600) return `${Math.floor(s / 60)}m`
    if (s < 86400) return `${Math.floor(s / 3600)}h`
    return `${Math.floor(s / 86400)}d`
  }
}

document.addEventListener("DOMContentLoaded", () => new E621Feed())