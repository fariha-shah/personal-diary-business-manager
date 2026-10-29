function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
import { useState } from 'react';
import { useProperties } from './hooks/useProperties';
import {
  Plus,
  X,
  MapPin,
  Bed,
  Bath,
  Ruler,
  Image as ImageIcon,
  Grid3x3,
  Rows3,
  Upload,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

/* ------------------------------- Constants ------------------------------- */

const STATUS_STYLES = {
  Available: 'bg-emerald-50 text-emerald-600',
  Sold: 'bg-rose-50 text-rose-600',
  Rented: 'bg-amber-50 text-amber-600',
};

const TYPES = ['All Types', 'House', 'Apartment', 'Commercial', 'Plot'];

/* -------------------------------- Gallery Card -------------------------------- */

function GalleryCard({ p, onOpen, onUploadMore, onDelete }) {
  const hasImages = p.images && p.images.length > 0;

  return (
    <div className="group relative bg-white rounded-xl border border-slate-100 overflow-hidden text-left flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
      {/* Media */}
      <div className="relative h-52 bg-slate-100 overflow-hidden">
        {hasImages ? (
          <>
            <img
              src={p.images[0]}
              alt={p.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
              onClick={() => onOpen(p)}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 pointer-events-none" />

            {/* Photo Count */}
            <span className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 text-white text-[11px] backdrop-blur-sm">
              <ImageIcon className="w-3.5 h-3.5" />
              {p.images.length}
            </span>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-4 text-center">
            <ImageIcon className="w-8 h-8 mb-2 stroke-1 text-slate-300" />

            <p className="text-xs font-medium text-slate-500">
              No photos uploaded
            </p>

            <button
              onClick={() => onUploadMore(p)}
              className="mt-2.5 px-3 py-1 bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50 transition"
            >
              + Upload Photos
            </button>
          </div>
        )}

        {/* Status */}
        <span
          className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-medium ${
            STATUS_STYLES[p.status] || 'bg-slate-100 text-slate-600'
          }`}
        >
          {p.status}
        </span>

        {/* Image Overlay Info */}
        {hasImages && (
          <div
            className="absolute bottom-0 left-0 right-0 p-3.5 text-white cursor-pointer"
            onClick={() => onOpen(p)}
          >
            <div className="text-[14px] font-semibold truncate">{p.title}</div>

            <div className="flex items-center gap-1 text-[11.5px] text-white/80">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{p.address}</span>
            </div>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="p-4">
        {!hasImages && (
          <div className="mb-2">
            <div className="text-[14px] font-semibold text-slate-800 truncate">
              {p.title}
            </div>

            <div className="flex items-center gap-1 text-[11.5px] text-slate-400">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{p.address}</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <span className="text-[15px] font-bold text-slate-800 truncate">
            PKR {p.price}
          </span>

          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 shrink-0">
            {p.type}
          </span>
        </div>

        {/* Property Details */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-3 text-[11.5px] text-slate-500">
            {p.type !== 'Plot' && p.type !== 'Commercial' && (
              <span className="flex items-center gap-1">
                <Bed className="w-3.5 h-3.5 text-slate-400" />
                {p.beds || 0}
              </span>
            )}

            {p.type !== 'Plot' && (
              <span className="flex items-center gap-1">
                <Bath className="w-3.5 h-3.5 text-slate-400" />
                {p.baths || 0}
              </span>
            )}

            <span className="flex items-center gap-1">
              <Ruler className="w-3.5 h-3.5 text-slate-400" />
              {p.area || '-'}
            </span>
          </div>

          {/* Manage + Delete */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onUploadMore(p)}
              className="text-xs font-medium text-amber-700 hover:text-amber-800 flex items-center gap-1"
              title="Add or update photos"
            >
              <Upload className="w-3.5 h-3.5" />
              Manage
            </button>

            <button
              onClick={() => onDelete(p)}
              className="text-xs font-medium text-rose-500 hover:text-rose-700 flex items-center gap-1"
              title="Delete property"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- Delete Confirmation -------------------------------- */

function DeleteConfirmationModal({ property, onClose, onConfirm }) {
  if (!property) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6">
          <div className="w-11 h-11 rounded-xl bg-rose-50 flex items-center justify-center mb-4">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
          </div>

          <h2 className="text-[17px] font-semibold text-slate-800">
            Delete Property?
          </h2>

          <p className="text-[13px] text-slate-500 mt-2 leading-relaxed">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-slate-700">
              "{property.title}"
            </span>
            ?
          </p>

          <p className="text-[12px] text-rose-500 mt-2">
            This will permanently remove the property and all of its photos.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-5 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-500 text-white text-[13px] font-medium hover:bg-rose-600 transition"
          >
            <Trash2 className="w-4 h-4" />
            Delete Property
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- Lightbox -------------------------------- */

function Lightbox({ property, onClose, onDeletePhoto }) {
  const [index, setIndex] = useState(0);

  const total = property?.images?.length || 0;

  if (!property || total === 0) return null;

  const next = () => {
    setIndex((current) => (current + 1) % total);
  };

  const prev = () => {
    setIndex((current) => (current - 1 + total) % total);
  };

  const handleDeleteCurrent = () => {
    onDeletePhoto(property.id, index);

    if (index >= total - 1) {
      setIndex(Math.max(0, total - 2));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 text-white border-b border-white/10">
        <div className="min-w-0">
          <div className="text-[15px] font-semibold truncate">
            {property.title}
          </div>

          <div className="flex items-center gap-1 text-[12px] text-white/60 truncate">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{property.address}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleDeleteCurrent}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs hover:bg-rose-500/30 transition"
          >
            <Trash2 className="w-4 h-4" />
            Delete Photo
          </button>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image */}
      <div className="flex-1 flex items-center justify-center px-6 relative min-h-0 py-4">
        {total > 1 && (
          <button
            onClick={prev}
            className="absolute left-4 sm:left-8 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 text-2xl"
          >
            &#8249;
          </button>
        )}

        <img
          src={property.images[index]}
          alt={`${property.title} ${index + 1}`}
          className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
        />

        {total > 1 && (
          <button
            onClick={next}
            className="absolute right-4 sm:right-8 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 text-2xl"
          >
            &#8250;
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-slate-950/80 border-t border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 text-white">
          <div className="text-[16px] font-semibold">PKR {property.price}</div>

          <div className="text-[12.5px] text-white/70">
            Photo {index + 1} of {total}
          </div>
        </div>

        {/* Thumbnails */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {property.images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              onClick={() => setIndex(i)}
              className={`shrink-0 w-16 h-14 rounded-lg overflow-hidden border-2 transition ${
                i === index
                  ? 'border-amber-400 opacity-100'
                  : 'border-transparent opacity-50 hover:opacity-100'
              }`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Photo Upload Modal ------------------------------ */

function UploadPhotosModal({ targetProperty, onClose, onSave }) {
  const [title, setTitle] = useState(
    targetProperty ? targetProperty.title : ''
  );

  const [price, setPrice] = useState(
    targetProperty ? targetProperty.price : ''
  );

  const [type, setType] = useState(
    targetProperty ? targetProperty.type : 'House'
  );

  const [status, setStatus] = useState(
    targetProperty ? targetProperty.status : 'Available'
  );

  const [address, setAddress] = useState(
    targetProperty ? targetProperty.address : ''
  );

  const [beds, setBeds] = useState(
    targetProperty ? targetProperty.beds || 0 : ''
  );

  const [baths, setBaths] = useState(
    targetProperty ? targetProperty.baths || 0 : ''
  );

  const [area, setArea] = useState(
    targetProperty ? targetProperty.area || '' : ''
  );

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [error, setError] = useState('');

  /* File Selection */

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    const validFiles = files.filter((file) => {
      return file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024;
    });

    if (validFiles.length !== files.length) {
      setError('Only image files up to 10MB are allowed.');
    } else {
      setError('');
    }

    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));

    setSelectedFiles((prev) => [...prev, ...validFiles]);

    setPreviewUrls((prev) => [...prev, ...newPreviews]);

    e.target.value = '';
  };

  /* Remove Preview */

  const handleRemovePreview = (idx) => {
    URL.revokeObjectURL(previewUrls[idx]);

    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));

    setPreviewUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Property title is required.');
      return;
    }

    if (!price.trim()) {
      setError('Property price is required.');
      return;
    }

    if (!address.trim()) {
      setError('Property address is required.');
      return;
    }

    if (!targetProperty && previewUrls.length === 0) {
      setError('Please select at least one property image.');
      return;
    }

    try {
      // Convert the actually-selected files into real, persistent
      // base64 image data (blob: preview URLs only work for this tab
      // session and go dead after a refresh — this is the real fix).
      const newImageDataUrls = await Promise.all(
        selectedFiles.map((file) => fileToDataUrl(file))
      );

      const existingImages = targetProperty?.images || [];
      const updatedImages = [...existingImages, ...newImageDataUrls];

      const savedProperty = {
        id: targetProperty?.id,
        title: title.trim(),
        type,
        status,
        address: address.trim(),
        price: price.trim(),
        beds: beds || 0,
        baths: baths || 0,
        area: area.trim() || '-',
        images: updatedImages,
      };

      await onSave(savedProperty);
    } catch (error) {
      console.error(error);
      setError('Could not process the selected images. Try a smaller photo.');
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-[16px] font-semibold text-slate-800">
              {targetProperty
                ? `Add Photos to "${targetProperty.title}"`
                : 'New Property Listing'}
            </h2>

            <p className="text-[11px] text-slate-400 mt-0.5">
              {targetProperty
                ? 'Add more photos to this property.'
                : 'Create a property listing and upload photos.'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="px-6 py-5 space-y-4 max-h-[80vh] overflow-y-auto"
        >
          {error && (
            <div className="text-[12.5px] text-rose-600 bg-rose-50 px-3 py-2 rounded-lg border border-rose-100">
              {error}
            </div>
          )}

          {/* Property Information */}
          {!targetProperty && (
            <>
              <div>
                <label className="text-[12.5px] font-medium text-slate-600 mb-1 block">
                  Property Title *
                </label>

                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 10 Marla Luxury House"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12.5px] font-medium text-slate-600 mb-1 block">
                    Property Type
                  </label>

                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13.5px] bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
                  >
                    <option>House</option>
                    <option>Apartment</option>
                    <option>Commercial</option>
                    <option>Plot</option>
                  </select>
                </div>

                <div>
                  <label className="text-[12.5px] font-medium text-slate-600 mb-1 block">
                    Status
                  </label>

                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13.5px] bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
                  >
                    <option>Available</option>
                    <option>Sold</option>
                    <option>Rented</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[12.5px] font-medium text-slate-600 mb-1 block">
                  Price (PKR) *
                </label>

                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 45,000,000"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>

              <div>
                <label className="text-[12.5px] font-medium text-slate-600 mb-1 block">
                  Address *
                </label>

                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. DHA Phase 6, Lahore"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[12px] font-medium text-slate-600 mb-1 flex items-center gap-1">
                    <Bed className="w-3.5 h-3.5" />
                    Beds
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={beds}
                    onChange={(e) => setBeds(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                </div>

                <div>
                  <label className="text-[12px] font-medium text-slate-600 mb-1 flex items-center gap-1">
                    <Bath className="w-3.5 h-3.5" />
                    Baths
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={baths}
                    onChange={(e) => setBaths(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                </div>

                <div>
                  <label className="text-[12px] font-medium text-slate-600 mb-1 flex items-center gap-1">
                    <Ruler className="w-3.5 h-3.5" />
                    Area
                  </label>

                  <input
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="1,100 sqft"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                </div>
              </div>
            </>
          )}

          {/* Upload Area */}
          <div>
            <label className="text-[12.5px] font-medium text-slate-600 mb-1 block">
              Select Images from Device
            </label>

            <label className="border-2 border-dashed border-amber-300 bg-amber-50/30 hover:bg-amber-50 rounded-xl p-6 text-center cursor-pointer block transition">
              <Upload className="w-8 h-8 text-amber-600 mx-auto mb-2" />

              <div className="text-[13px] font-medium text-slate-700">
                Click to browse images
              </div>

              <div className="text-[11px] text-slate-400 mt-1">
                PNG, JPG, WEBP up to 10MB each
              </div>

              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Selected Images */}
          {previewUrls.length > 0 && (
            <div>
              <label className="text-[12.5px] font-medium text-slate-600 mb-2 block">
                Selected Images ({previewUrls.length})
              </label>

              <div className="grid grid-cols-4 gap-2">
                {previewUrls.map((url, idx) => (
                  <div
                    key={`${url}-${idx}`}
                    className="relative h-20 rounded-lg overflow-hidden border border-slate-200 group"
                  >
                    <img
                      src={url}
                      alt="Upload preview"
                      className="w-full h-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => handleRemovePreview(idx)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-rose-600 transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Existing Photos */}
          {targetProperty?.images?.length > 0 && (
            <div>
              <label className="text-[12.5px] font-medium text-slate-600 mb-2 block">
                Existing Photos ({targetProperty.images.length})
              </label>

              <div className="grid grid-cols-4 gap-2">
                {targetProperty.images.map((src, idx) => (
                  <div
                    key={`${src}-${idx}`}
                    className="h-20 rounded-lg overflow-hidden border border-slate-200"
                  >
                    <img
                      src={src}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-[13px] text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#0b1830] text-white font-medium text-[13px] hover:bg-[#0f2140] transition"
            >
              {targetProperty ? 'Save Photos' : 'Create Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* -------------------------------- Main Page -------------------------------- */

export default function PropertyGallery() {
  const { properties, addProperty, updateProperty, deletePropertyById } =
    useProperties();

  const [typeFilter, setTypeFilter] = useState('All Types');

  const [selectedProperty, setSelectedProperty] = useState(null);

  const [targetPropertyForUpload, setTargetPropertyForUpload] = useState(null);

  const [propertyToDelete, setPropertyToDelete] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);

  const [cols, setCols] = useState(3);

  /* Filtering */

  const filtered = properties.filter(
    (property) => typeFilter === 'All Types' || property.type === typeFilter
  );

  /* Save Property */

 const handleSaveProperty = async (savedProperty) => {
    try {
      const exists = properties.some(
        (property) => property.id === savedProperty.id
      );

      if (exists) {
        await updateProperty(savedProperty.id, savedProperty);
      } else {
        await addProperty(savedProperty);
      }

      setShowAddModal(false);
      setTargetPropertyForUpload(null);
    } catch (error) {
      console.error(error);
      alert('Could not save property. If it has photos, try removing one — Firestore has a 1MB size limit per record.');
    }
  };
  /* Delete Entire Property */

  const handleDeleteProperty = async () => {
    if (!propertyToDelete) return;

    const propertyId = propertyToDelete.id;

    try {
      await deletePropertyById(propertyId);

      if (selectedProperty && selectedProperty.id === propertyId) {
        setSelectedProperty(null);
      }

      setPropertyToDelete(null);
    } catch (error) {
      console.error(error);
      alert('Could not delete property.');
    }
  };

  /* Delete Photo */

  const handleDeletePhoto = async (propertyId, photoIndex) => {
    const property = properties.find((p) => p.id === propertyId);
    if (!property) return;

    const newImages = property.images.filter((_, index) => index !== photoIndex);

    try {
      await updateProperty(propertyId, { images: newImages });
    } catch (error) {
      console.error(error);
      alert('Could not delete photo.');
      return;
    }

    setSelectedProperty((current) => {
      if (!current || current.id !== propertyId) {
        return current;
      }

      if (newImages.length === 0) {
        return null;
      }

      return {
        ...current,
        images: newImages,
      };
    });
  };

  const hasProperties = properties.length > 0;

  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-50 font-sans">
      <div className="flex-1 px-6 md:px-8 py-6 max-w-[1600px] w-full mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <h1 className="text-[22px] font-bold text-slate-800">
              Property Image Gallery
            </h1>

            <p className="text-[13px] text-slate-500 mt-0.5">
              Upload, organize, and manage property images.
            </p>
          </div>

          <button
            onClick={() => {
              setTargetPropertyForUpload(null);
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0b1830] text-white text-[13px] font-medium hover:bg-[#0f2140] transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Upload New Listing
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3.5 py-1.5 rounded-full text-[12.5px] font-medium border transition-colors ${
                  typeFilter === type
                    ? 'bg-amber-400 border-amber-400 text-[#0b1830]'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Grid Controls */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
            <button
              onClick={() => setCols(3)}
              className={`w-7 h-7 rounded-md flex items-center justify-center transition ${
                cols === 3
                  ? 'bg-slate-100 text-slate-800'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="3 columns"
            >
              <Grid3x3 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setCols(2)}
              className={`w-7 h-7 rounded-md flex items-center justify-center transition ${
                cols === 2
                  ? 'bg-slate-100 text-slate-800'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="2 columns"
            >
              <Rows3 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Property Grid / Empty State */}

        {!hasProperties ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 py-20 px-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-8 h-8 text-slate-400" />
            </div>

            <h2 className="text-[16px] font-semibold text-slate-700">
              No properties yet
            </h2>

            <p className="text-[13px] text-slate-400 mt-1 max-w-sm mx-auto">
              Start by creating your first property listing and upload its
              images.
            </p>

            <button
              onClick={() => {
                setTargetPropertyForUpload(null);
                setShowAddModal(true);
              }}
              className="inline-flex items-center gap-2 mt-5 px-4 py-2.5 rounded-xl bg-[#0b1830] text-white text-[13px] font-medium hover:bg-[#0f2140] transition"
            >
              <Plus className="w-4 h-4" />
              Create First Listing
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200/80 py-16 text-center text-slate-400 text-[13.5px]">
            No properties match this filter.
          </div>
        ) : (
          <div
            className={`grid gap-6 ${
              cols === 3
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1 sm:grid-cols-2'
            }`}
          >
            {filtered.map((property) => (
              <GalleryCard
                key={property.id}
                p={property}
                onOpen={setSelectedProperty}
                onUploadMore={(target) => {
                  setTargetPropertyForUpload(target);
                  setShowAddModal(true);
                }}
                onDelete={(property) => {
                  setPropertyToDelete(property);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}

      {selectedProperty && selectedProperty.images?.length > 0 && (
        <Lightbox
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onDeletePhoto={handleDeletePhoto}
        />
      )}

      {/* Upload / Create Modal */}

      {showAddModal && (
        <UploadPhotosModal
          targetProperty={targetPropertyForUpload}
          onClose={() => {
            setShowAddModal(false);
            setTargetPropertyForUpload(null);
          }}
          onSave={handleSaveProperty}
        />
      )}

      {/* Delete Confirmation */}

      {propertyToDelete && (
        <DeleteConfirmationModal
          property={propertyToDelete}
          onClose={() => setPropertyToDelete(null)}
          onConfirm={handleDeleteProperty}
        />
      )}
    </div>
  );
}
