import React, { useEffect, useState } from 'react';
import {
  User as UserIcon,
  Plus,
  Trash2,
  CheckCircle2,
  LogOut,
  Disc3,
  ArrowRight,
  AlertCircle,
  SlidersHorizontal,
} from 'lucide-react';
import { BrandHeader } from './BrandHeader';
import {
  useFirebaseAuth,
  BrakeSystemType,
  SaveProfileInput,
  SaveVehicleInput,
} from '../../context/FirebaseContext';
import {
  BRAND_WHEELS,
  WHEEL_FINISHES,
  WheelFinishId,
  formatZAR,
} from '../../data/catalogue';
import { useRouter } from '../../utils/router';
import { useForgedStore } from '../../store/useForgedStore';

const BRAKE_SYSTEM_OPTIONS: BrakeSystemType[] = [
  'M Compound Steel',
  'M Carbon Ceramic',
  'Bespoke Big Brake Kit',
];

const FINISH_OPTIONS: WheelFinishId[] = [
  'silver',
  'satin-black',
  'champagne-bronze',
  'dark-gunmetal',
];

export const AccountGaragePage: React.FC = () => {
  const { navigate } = useRouter();
  const { openEnquiryModal } = useForgedStore();
  const {
    user,
    authReady,
    profile,
    vehicles,
    loadingData,
    authError,
    signInWithGoogle,
    signOutUser,
    saveUserProfile,
    addGarageVehicle,
    deleteGarageVehicle,
  } = useFirebaseAuth();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<SaveProfileInput>({
    displayName: '',
    city: 'Johannesburg',
    primaryMake: 'BMW',
    primaryModel: 'M3 Competition Sedan (G80)',
    primaryYear: '2025',
    chassisCode: 'G80',
    exteriorPaint: 'Brooklyn Grey',
    brakeSystem: 'M Compound Steel',
    preferredFinish: 'satin-black',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSavedMsg, setProfileSavedMsg] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [vehicleForm, setVehicleForm] = useState<SaveVehicleInput>({
    make: 'BMW',
    model: 'M3 Competition Sedan (G80)',
    year: '2025',
    chassisCode: 'G80',
    exteriorPaint: 'Dravit Grey',
    brakeSystem: 'M Compound Steel',
    targetWheelSlug: BRAND_WHEELS[0]?.slug || 'fsa001-black-matte',
    targetFinish: BRAND_WHEELS[0]?.defaultFinish || 'satin-black',
    notes: '',
  });
  const [savingVehicle, setSavingVehicle] = useState(false);

  useEffect(() => {
    if (profile) {
      setProfileForm({
        displayName: profile.displayName || user?.displayName || '',
        city: profile.city || 'Johannesburg',
        primaryMake: profile.primaryMake || 'BMW',
        primaryModel: profile.primaryModel || 'M3 Competition Sedan (G80)',
        primaryYear: profile.primaryYear || '2025',
        chassisCode: profile.chassisCode || 'G80',
        exteriorPaint: profile.exteriorPaint || 'Brooklyn Grey',
        brakeSystem: profile.brakeSystem || 'M Compound Steel',
        preferredFinish: profile.preferredFinish || 'satin-black',
      });
    } else if (user) {
      setProfileForm((prev) => ({
        ...prev,
        displayName: user.displayName || prev.displayName || 'FORGED Client',
      }));
      setIsEditingProfile(true);
    }
  }, [profile, user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setProfileSavedMsg(null);
    setSavingProfile(true);
    try {
      await saveUserProfile(profileForm);
      setProfileSavedMsg('Profile saved');
      setIsEditingProfile(false);
      window.setTimeout(() => setProfileSavedMsg(null), 3000);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Unable to save profile.'
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSavingVehicle(true);
    try {
      const matchedWheel = BRAND_WHEELS.find(
        (w) => w.slug === vehicleForm.targetWheelSlug
      );
      await addGarageVehicle({
        ...vehicleForm,
        targetFinish: matchedWheel?.defaultFinish || vehicleForm.targetFinish,
      });
      setShowAddVehicle(false);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Unable to add vehicle to garage.'
      );
    } finally {
      setSavingVehicle(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F7] pb-24">
      <BrandHeader />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 md:px-10 pt-12">
        {/* Clean Minimalist Header */}
        <div className="border-b border-[#22222A] pb-6 mb-10 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-light tracking-[-0.03em] text-white">
              My Garage
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Pair your BMW M chassis with in-stock forged wheel sets.
            </p>
          </div>

          {user && (
            <button
              type="button"
              onClick={signOutUser}
              className="px-3.5 py-2 rounded-lg border border-[#26262E] hover:border-neutral-600 bg-[#121215] text-xs font-mono text-neutral-300 hover:text-white flex items-center gap-2 transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-3.5 h-3.5 text-neutral-400" />
              <span>Sign Out</span>
            </button>
          )}
        </div>

        {!authReady ? (
          <div className="py-16 text-center text-xs font-mono uppercase tracking-widest text-neutral-500">
            Loading session...
          </div>
        ) : !user ? (
          /* Step 1: Minimalist Sign-In View */
          <div className="max-w-md mx-auto bg-[#111115] border border-[#26262E] rounded-2xl p-8 space-y-6 text-center">
            <div className="w-11 h-11 rounded-full bg-[#18181F] border border-[#26262E] flex items-center justify-center mx-auto text-[#FF5500]">
              <UserIcon className="w-5 h-5" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-medium tracking-tight text-white">
                Sign in to your Garage
              </h2>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Save your vehicle specifications and pair them directly with our in-stock wheel inventory.
              </p>
            </div>

            {authError && (
              <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-300 flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => signInWithGoogle().catch(() => {})}
              className="w-full py-3 px-5 rounded-xl bg-white text-black hover:bg-neutral-200 font-medium text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
            >
              <span>Continue with Google</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Signed-In Flow */
          <div className="space-y-10">
            {formError && (
              <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-xs font-mono text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Step 2: Compact Client Profile Bar */}
            <section className="bg-[#111115] border border-[#22222A] rounded-2xl p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#1A1A22] border border-[#2E2E3A] flex items-center justify-center text-sm font-mono font-semibold text-white shrink-0">
                    {(profileForm.displayName || user.email || 'F')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-sm sm:text-base font-medium text-white truncate">
                        {profileForm.displayName || user.displayName || 'Client'}
                      </h2>
                      {profileSavedMsg && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{profileSavedMsg}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 truncate">
                      {[
                        user.email,
                        profileForm.city,
                        `${profileForm.primaryYear} ${profileForm.primaryMake} ${profileForm.primaryModel}`,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile((prev) => !prev)}
                    className="px-3.5 py-2 rounded-lg border border-[#26262E] hover:border-neutral-500 text-xs font-mono text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>{isEditingProfile ? 'Close' : 'Edit Profile'}</span>
                  </button>
                </div>
              </div>

              {/* Collapsible Profile & Primary Vehicle Editor */}
              {isEditingProfile && (
                <form
                  onSubmit={handleSaveProfile}
                  className="mt-6 pt-6 border-t border-[#22222A] space-y-5"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={100}
                        value={profileForm.displayName}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, displayName: e.target.value })
                        }
                        className="w-full h-10 px-3 rounded-lg bg-[#0A0A0D] border border-[#26262E] text-xs text-white focus:outline-none focus:border-neutral-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">
                        City
                      </label>
                      <input
                        type="text"
                        maxLength={80}
                        value={profileForm.city}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, city: e.target.value })
                        }
                        placeholder="Johannesburg / Cape Town"
                        className="w-full h-10 px-3 rounded-lg bg-[#0A0A0D] border border-[#26262E] text-xs text-white focus:outline-none focus:border-neutral-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">
                        Primary Model
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={80}
                        value={profileForm.primaryModel}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, primaryModel: e.target.value })
                        }
                        placeholder="M3 Competition Sedan (G80)"
                        className="w-full h-10 px-3 rounded-lg bg-[#0A0A0D] border border-[#26262E] text-xs text-white focus:outline-none focus:border-neutral-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">
                        Year
                      </label>
                      <input
                        type="text"
                        required
                        minLength={4}
                        maxLength={20}
                        value={profileForm.primaryYear}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, primaryYear: e.target.value })
                        }
                        className="w-full h-10 px-3 rounded-lg bg-[#0A0A0D] border border-[#26262E] text-xs text-white focus:outline-none focus:border-neutral-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">
                        Brake System
                      </label>
                      <select
                        value={profileForm.brakeSystem}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            brakeSystem: e.target.value as BrakeSystemType,
                          })
                        }
                        className="w-full h-10 px-3 rounded-lg bg-[#0A0A0D] border border-[#26262E] text-xs text-white focus:outline-none focus:border-neutral-500"
                      >
                        {BRAKE_SYSTEM_OPTIONS.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">
                        Preferred Finish
                      </label>
                      <select
                        value={profileForm.preferredFinish}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            preferredFinish: e.target.value as WheelFinishId,
                          })
                        }
                        className="w-full h-10 px-3 rounded-lg bg-[#0A0A0D] border border-[#26262E] text-xs text-white focus:outline-none focus:border-neutral-500"
                      >
                        {FINISH_OPTIONS.map((f) => (
                          <option key={f} value={f}>
                            {WHEEL_FINISHES[f].name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="px-5 py-2 rounded-lg bg-white text-black hover:bg-neutral-200 disabled:opacity-50 text-xs font-medium transition-colors cursor-pointer"
                    >
                      {savingProfile ? 'Saving...' : 'Save Profile'}
                    </button>
                  </div>
                </form>
              )}
            </section>

            {/* Step 3: Saved Garage & Wheel Pairings */}
            <section className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-medium text-white">
                  Saved Vehicles ({vehicles.length})
                </h3>

                <button
                  type="button"
                  onClick={() => setShowAddVehicle((prev) => !prev)}
                  className="px-4 py-2 rounded-lg bg-white text-black hover:bg-neutral-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showAddVehicle ? 'Cancel' : 'Add Vehicle'}</span>
                </button>
              </div>

              {/* Streamlined Add Vehicle Form */}
              {showAddVehicle && (
                <form
                  onSubmit={handleAddVehicle}
                  className="bg-[#111115] border border-[#26262E] rounded-2xl p-6 space-y-5"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">
                        Vehicle Model
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={80}
                        value={vehicleForm.model}
                        onChange={(e) =>
                          setVehicleForm({ ...vehicleForm, model: e.target.value })
                        }
                        placeholder="M3 Competition Sedan (G80)"
                        className="w-full h-10 px-3 rounded-lg bg-[#0A0A0D] border border-[#26262E] text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">
                        Year &amp; Chassis
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          minLength={4}
                          maxLength={20}
                          value={vehicleForm.year}
                          onChange={(e) =>
                            setVehicleForm({ ...vehicleForm, year: e.target.value })
                          }
                          placeholder="2025"
                          className="w-full h-10 px-3 rounded-lg bg-[#0A0A0D] border border-[#26262E] text-xs text-white"
                        />
                        <input
                          type="text"
                          required
                          maxLength={40}
                          value={vehicleForm.chassisCode}
                          onChange={(e) =>
                            setVehicleForm({
                              ...vehicleForm,
                              chassisCode: e.target.value,
                            })
                          }
                          placeholder="G80"
                          className="w-full h-10 px-3 rounded-lg bg-[#0A0A0D] border border-[#26262E] text-xs text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">
                        Exterior Paint
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={60}
                        value={vehicleForm.exteriorPaint}
                        onChange={(e) =>
                          setVehicleForm({
                            ...vehicleForm,
                            exteriorPaint: e.target.value,
                          })
                        }
                        placeholder="Dravit Grey"
                        className="w-full h-10 px-3 rounded-lg bg-[#0A0A0D] border border-[#26262E] text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">
                        Brake System
                      </label>
                      <select
                        value={vehicleForm.brakeSystem}
                        onChange={(e) =>
                          setVehicleForm({
                            ...vehicleForm,
                            brakeSystem: e.target.value as BrakeSystemType,
                          })
                        }
                        className="w-full h-10 px-3 rounded-lg bg-[#0A0A0D] border border-[#26262E] text-xs text-white"
                      >
                        {BRAKE_SYSTEM_OPTIONS.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-mono uppercase text-neutral-400 mb-1.5">
                        Paired In-Stock Wheel Set
                      </label>
                      <select
                        value={vehicleForm.targetWheelSlug}
                        onChange={(e) =>
                          setVehicleForm({
                            ...vehicleForm,
                            targetWheelSlug: e.target.value,
                          })
                        }
                        className="w-full h-10 px-3 rounded-lg bg-[#0A0A0D] border border-[#26262E] text-xs text-white"
                      >
                        {BRAND_WHEELS.map((w) => (
                          <option key={w.slug} value={w.slug}>
                            {w.model} · {w.sizesAvailable} · {formatZAR(w.priceZAR)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={savingVehicle}
                      className="px-5 py-2 rounded-lg bg-[#FF5500] hover:bg-[#FF6B1A] text-white text-xs font-medium cursor-pointer"
                    >
                      {savingVehicle ? 'Saving...' : 'Save to Garage'}
                    </button>
                  </div>
                </form>
              )}

              {/* Saved Vehicles Cards */}
              {loadingData ? (
                <div className="py-12 text-center text-xs font-mono text-neutral-500">
                  Loading garage...
                </div>
              ) : vehicles.length === 0 ? (
                <div className="p-6 rounded-2xl bg-[#111115] border border-[#22222A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {profileForm.primaryYear} {profileForm.primaryMake}{' '}
                      {profileForm.primaryModel}
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {profileForm.brakeSystem} · Add a vehicle above to pair specific in-stock wheel sets.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/#catalogue')}
                    className="px-4 py-2 rounded-lg border border-[#26262E] hover:border-neutral-500 text-xs font-mono text-neutral-200 hover:text-white flex items-center gap-2 transition-colors cursor-pointer shrink-0"
                  >
                    <Disc3 className="w-3.5 h-3.5 text-[#FF5500]" />
                    <span>Browse Wheel Catalogue</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {vehicles.map((veh) => {
                    const wheelObj =
                      BRAND_WHEELS.find((w) => w.slug === veh.targetWheelSlug) ||
                      BRAND_WHEELS[0];

                    return (
                      <div
                        key={veh.id}
                        className="bg-[#111115] border border-[#22222A] hover:border-neutral-700 rounded-2xl p-6 flex flex-col justify-between gap-5 transition-colors"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="text-base font-medium text-white">
                                {veh.year} {veh.make} {veh.model}
                              </h4>
                              <p className="text-xs text-neutral-400 mt-0.5">
                                {[veh.chassisCode, veh.exteriorPaint, veh.brakeSystem]
                                  .filter(Boolean)
                                  .join(' · ')}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => deleteGarageVehicle(veh.id)}
                              title="Remove vehicle"
                              aria-label="Remove vehicle"
                              className="w-8 h-8 rounded-lg hover:bg-red-950/50 text-neutral-500 hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Paired Rim Summary */}
                          <div className="pt-3 border-t border-[#1E1E26] flex items-baseline justify-between gap-2 text-xs">
                            <div>
                              <span className="text-neutral-500 block">Paired Rim</span>
                              <span className="text-white font-medium">
                                {wheelObj.model} ({wheelObj.sizesAvailable})
                              </span>
                            </div>
                            <span className="font-mono text-neutral-200">
                              {formatZAR(wheelObj.priceZAR)}
                            </span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-[#1E1E26] flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => navigate(`/wheels/${wheelObj.slug}`)}
                            className="flex-1 py-2 px-3 rounded-lg bg-[#18181F] hover:bg-neutral-800 text-white text-xs font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Disc3 className="w-3.5 h-3.5 text-[#FF5500]" />
                            <span>View Wheel</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openEnquiryModal({
                                subject: `Garage Fitment Enquiry: ${wheelObj.model} for ${veh.year} ${veh.make} ${veh.model}`,
                                finish: wheelObj.finishName,
                                priceZAR: wheelObj.priceZAR,
                                domain: 'brand',
                              })
                            }
                            className="py-2 px-4 rounded-lg bg-white text-black hover:bg-neutral-200 text-xs font-medium transition-colors cursor-pointer"
                          >
                            Enquire
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
};
