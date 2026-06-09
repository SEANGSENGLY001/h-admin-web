import { useState, useEffect } from "react";
import { createTitle, updateTitle } from "../../services/titles";
import { createVideo, updateVideo, deleteVideo, getVideos } from "../../services/videos";
import { getCategories } from "../../services/categories";
import { getTypes } from "../../services/types";
import { getGenres } from "../../services/genres";
import ImageUpload from "../../components/ImageUpload";
import "./TitleForm.css";

const emptyTitle = {
  contentType: "movie",
  title: "",
  season: null,
  totalEpisodes: null,
  thumbnailUrl: "",
  posterUrl: "",
  description: "",
  rating: null,
  year: null,
  duration: null,
  releaseDate: "",
  categoryIds: [],
  typeIds: [],
  genreIds: [],
  isNew: false,
  isTrending: false,
  isUpcoming: false,
  trendingScore: 0,
  hasSubtitles: false,
  subtitleLanguages: "",
  hasHD: false,
  maxQuality: 1080,
  status: "active",
  sortOrder: 0,
};

export default function TitleForm({ title, onSaved, onCancel }) {
  const isEdit = !!title;
  const [form, setForm] = useState(emptyTitle);
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [genres, setGenres] = useState([]);
  const [saving, setSaving] = useState(false);

  const [videoForm, setVideoForm] = useState(null);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
    getTypes().then(setTypes).catch(() => {});
    getGenres().then(setGenres).catch(() => {});
  }, []);

  useEffect(() => {
    if (title) {
      setForm({
        contentType: title.contentType || "movie",
        title: title.title || "",
        season: title.season ?? null,
        totalEpisodes: title.totalEpisodes ?? null,
        thumbnailUrl: title.thumbnailUrl || "",
        posterUrl: title.posterUrl || "",
        description: title.description || "",
        rating: title.rating ?? null,
        year: title.year ?? null,
        duration: title.duration ?? null,
        releaseDate: title.releaseDate || "",
        categoryIds: title.categoryIds || [],
        typeIds: title.typeIds || [],
        genreIds: title.genreIds || [],
        isNew: title.isNew || false,
        isTrending: title.isTrending || false,
        isUpcoming: title.isUpcoming || false,
        trendingScore: title.trendingScore || 0,
        hasSubtitles: title.hasSubtitles || false,
        subtitleLanguages: title.subtitleLanguages || "",
        hasHD: title.hasHD || false,
        maxQuality: title.maxQuality || 1080,
        status: title.status || "active",
        sortOrder: title.sortOrder ?? 0,
      });
      getVideos(title.id).then(setVideos).catch(() => {});
    } else {
      setForm(emptyTitle);
      setVideos([]);
    }
  }, [title]);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleArray(field, id) {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(id)
        ? prev[field].filter((i) => i !== id)
        : [...prev[field], id],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (payload.contentType === "movie") {
        payload.season = null;
        payload.totalEpisodes = null;
      }
      if (payload.releaseDate) {
        payload.releaseDate = new Date(payload.releaseDate).toISOString();
      } else {
        delete payload.releaseDate;
      }

      if (isEdit) {
        await updateTitle(title.id, payload);
      } else {
        const newId = await createTitle(payload);
        for (const v of videos) {
          await createVideo(newId, v);
        }
        onSaved();
        return;
      }
      onSaved();
    } catch {
      alert("Failed to save. Check console.");
    } finally {
      setSaving(false);
    }
  }

  function addVideo() {
    setVideos((prev) => [
      ...prev,
      { episode: prev.length + 1, episodeTitle: "", sortOrder: prev.length + 1, videoUrls: [], subtitleUrls: [], _temp: true },
    ]);
  }

  function updateVideoField(index, field, value) {
    setVideos((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function removeVideo(index) {
    setVideos((prev) => prev.filter((_, i) => i !== index));
  }

  function addVideoUrl(vIndex) {
    setVideos((prev) => {
      const next = [...prev];
      next[vIndex] = { ...next[vIndex], videoUrls: [...(next[vIndex].videoUrls || []), { url: "", server: "" }] };
      return next;
    });
  }

  function updateVideoUrl(vIndex, uIndex, field, value) {
    setVideos((prev) => {
      const next = [...prev];
      const urls = [...next[vIndex].videoUrls];
      urls[uIndex] = { ...urls[uIndex], [field]: value };
      next[vIndex] = { ...next[vIndex], videoUrls: urls };
      return next;
    });
  }

  function removeVideoUrl(vIndex, uIndex) {
    setVideos((prev) => {
      const next = [...prev];
      next[vIndex] = { ...next[vIndex], videoUrls: next[vIndex].videoUrls.filter((_, i) => i !== uIndex) };
      return next;
    });
  }

  const CheckboxGroup = ({ label, field, items }) => (
    <div className="tf-field">
      <label className="tf-label">{label}</label>
      <div className="tf-checkbox-group">
        {items.map((item) => (
          <label key={item.id} className="tf-checkbox-item">
            <input
              type="checkbox"
              checked={form[field].includes(item.id)}
              onChange={() => toggleArray(field, item.id)}
            />
            {item.name}
          </label>
        ))}
        {items.length === 0 && <span className="tf-empty-hint">No items available</span>}
      </div>
    </div>
  );

  return (
    <form className="tf-form" onSubmit={handleSubmit}>
      <div className="tf-grid">
        <div className="tf-field full">
          <label className="tf-label">Title *</label>
          <input className="tf-input" value={form.title} onChange={(e) => set("title", e.target.value)} required placeholder="Movie or series title" />
        </div>

        <div className="tf-field">
          <label className="tf-label">Content Type *</label>
          <div className="tf-radio-group">
            <label className={`tf-radio${form.contentType === "movie" ? " active" : ""}`}>
              <input type="radio" name="contentType" value="movie" checked={form.contentType === "movie"} onChange={() => set("contentType", "movie")} /> Movie
            </label>
            <label className={`tf-radio${form.contentType === "series" ? " active" : ""}`}>
              <input type="radio" name="contentType" value="series" checked={form.contentType === "series"} onChange={() => set("contentType", "series")} /> Series
            </label>
          </div>
        </div>

        {form.contentType === "series" && (
          <>
            <div className="tf-field">
              <label className="tf-label">Season</label>
              <input className="tf-input" type="number" min="1" value={form.season ?? ""} onChange={(e) => set("season", e.target.value ? Number(e.target.value) : null)} />
            </div>
            <div className="tf-field">
              <label className="tf-label">Total Episodes</label>
              <input className="tf-input" type="number" min="1" value={form.totalEpisodes ?? ""} onChange={(e) => set("totalEpisodes", e.target.value ? Number(e.target.value) : null)} />
            </div>
          </>
        )}

        <div className="tf-field">
          <label className="tf-label">Rating (0–10)</label>
          <input className="tf-input" type="number" min="0" max="10" step="0.1" value={form.rating ?? ""} onChange={(e) => set("rating", e.target.value ? Number(e.target.value) : null)} />
        </div>
        <div className="tf-field">
          <label className="tf-label">Year</label>
          <input className="tf-input" type="number" min="1900" max="2099" value={form.year ?? ""} onChange={(e) => set("year", e.target.value ? Number(e.target.value) : null)} />
        </div>
        <div className="tf-field">
          <label className="tf-label">Duration (min)</label>
          <input className="tf-input" type="number" min="1" value={form.duration ?? ""} onChange={(e) => set("duration", e.target.value ? Number(e.target.value) : null)} />
        </div>
        <div className="tf-field">
          <label className="tf-label">Sort Order</label>
          <input className="tf-input" type="number" min="0" value={form.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value))} />
        </div>

        <div className="tf-field">
          <label className="tf-label">Release Date</label>
          <input className="tf-input" type="date" value={form.releaseDate ? form.releaseDate.split("T")[0] : ""} onChange={(e) => set("releaseDate", e.target.value)} />
        </div>
        <div className="tf-field">
          <label className="tf-label">Status</label>
          <select className="tf-input" value={form.status} onChange={(e) => set("status", e.target.value)}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
            <option value="upcoming">Upcoming</option>
          </select>
        </div>

        <div className="tf-field full">
          <label className="tf-label">Description</label>
          <textarea className="tf-input tf-textarea" rows="3" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Brief description..." />
        </div>

        <div className="tf-field full">
          <ImageUpload label="Thumbnail URL" value={form.thumbnailUrl} onChange={(v) => set("thumbnailUrl", v)} placeholder="https://example.com/thumb.jpg" />
        </div>
        <div className="tf-field full">
          <ImageUpload label="Poster URL" value={form.posterUrl} onChange={(v) => set("posterUrl", v)} placeholder="https://example.com/poster.jpg" />
        </div>

        <div className="tf-field full">
          <CheckboxGroup label="Categories" field="categoryIds" items={categories} />
        </div>
        <div className="tf-field full">
          <CheckboxGroup label="Types" field="typeIds" items={types} />
        </div>
        <div className="tf-field full">
          <CheckboxGroup label="Genres" field="genreIds" items={genres} />
        </div>

        <div className="tf-field full">
          <label className="tf-label">Flags</label>
          <div className="tf-checkbox-group horizontal">
            <label className="tf-checkbox-item"><input type="checkbox" checked={form.isNew} onChange={(e) => set("isNew", e.target.checked)} /> New</label>
            <label className="tf-checkbox-item"><input type="checkbox" checked={form.isTrending} onChange={(e) => set("isTrending", e.target.checked)} /> Trending</label>
            <label className="tf-checkbox-item"><input type="checkbox" checked={form.isUpcoming} onChange={(e) => set("isUpcoming", e.target.checked)} /> Upcoming</label>
            <label className="tf-checkbox-item"><input type="checkbox" checked={form.hasSubtitles} onChange={(e) => set("hasSubtitles", e.target.checked)} /> Subtitles</label>
            <label className="tf-checkbox-item"><input type="checkbox" checked={form.hasHD} onChange={(e) => set("hasHD", e.target.checked)} /> HD</label>
          </div>
        </div>

        <div className="tf-field">
          <label className="tf-label">Trending Score</label>
          <input className="tf-input" type="number" min="0" value={form.trendingScore} onChange={(e) => set("trendingScore", Number(e.target.value))} />
        </div>
        <div className="tf-field">
          <label className="tf-label">Max Quality</label>
          <select className="tf-input" value={form.maxQuality} onChange={(e) => set("maxQuality", Number(e.target.value))}>
            <option value={360}>360p</option>
            <option value={480}>480p</option>
            <option value={720}>720p</option>
            <option value={1080}>1080p</option>
            <option value={2160}>4K</option>
          </select>
        </div>

        <div className="tf-field full">
          <label className="tf-label">Subtitle Languages (comma-separated)</label>
          <input className="tf-input" value={form.subtitleLanguages} onChange={(e) => set("subtitleLanguages", e.target.value)} placeholder="English, Spanish, French" />
        </div>
      </div>

      <div className="tf-section">
        <h4>Videos</h4>
        {videos.length === 0 && <p className="tf-empty-hint">No videos added yet.</p>}
        {videos.map((v, i) => (
          <div key={i} className="tf-video-card">
            <div className="tf-video-row">
              <div className="tf-field" style={{ flex: 1 }}>
                <label className="tf-label">Episode #</label>
                <input className="tf-input" type="number" min="1" value={v.episode} onChange={(e) => updateVideoField(i, "episode", Number(e.target.value))} />
              </div>
              <div className="tf-field" style={{ flex: 2 }}>
                <label className="tf-label">Title</label>
                <input className="tf-input" value={v.episodeTitle} onChange={(e) => updateVideoField(i, "episodeTitle", e.target.value)} placeholder="Episode title" />
              </div>
              <div className="tf-field" style={{ flex: 1 }}>
                <label className="tf-label">Sort</label>
                <input className="tf-input" type="number" min="0" value={v.sortOrder} onChange={(e) => updateVideoField(i, "sortOrder", Number(e.target.value))} />
              </div>
              <button type="button" className="tf-remove-btn" onClick={() => removeVideo(i)} title="Remove video">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            <div className="tf-url-section">
              <label className="tf-label">Video URLs</label>
              {(v.videoUrls || []).map((vu, ui) => (
                <div key={ui} className="tf-url-row">
                  <input className="tf-input" value={vu.url} onChange={(e) => updateVideoUrl(i, ui, "url", e.target.value)} placeholder="https://..." />
                  <input className="tf-input" value={vu.server} onChange={(e) => updateVideoUrl(i, ui, "server", e.target.value)} placeholder="Server name" />
                  <button type="button" className="tf-url-remove" onClick={() => removeVideoUrl(i, ui)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                </div>
              ))}
              <button type="button" className="tf-add-url-btn" onClick={() => addVideoUrl(i)}>+ Add URL</button>
            </div>
          </div>
        ))}
        <button type="button" className="tf-add-video-btn" onClick={addVideo}>+ Add Video</button>
      </div>

      <div className="tf-actions">
        <button type="button" className="tf-btn cancel" onClick={onCancel} disabled={saving}>Cancel</button>
        <button type="submit" className="tf-btn save" disabled={saving}>{saving ? "Saving..." : isEdit ? "Update" : "Create"}</button>
      </div>
    </form>
  );
}
