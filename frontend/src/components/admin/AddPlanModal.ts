"use client"

import React from 'react'

function AddPlanModal({currentFeature, newPlan,setNewPlan,setCurrentFeature}) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Create New Plan</h3>
              <form onSubmit={handleCreatePlan}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={newPlan.name}
                    onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                    className="mt-1 p-2 w-full border rounded-md"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newPlan.price}
                    onChange={(e) => setNewPlan({ ...newPlan, price: parseFloat(e.target.value) })}
                    className="mt-1 p-2 w-full border rounded-md"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Billing Cycle</label>
                  <div className="flex gap-2">
                    <select
                      value={newPlan.billingCycle.interval}
                      onChange={(e) =>
                        setNewPlan({
                          ...newPlan,
                          billingCycle: {
                            ...newPlan.billingCycle,
                            interval: e.target.value as "day" | "week" | "month" | "year",
                          },
                        })
                      }
                      className="mt-1 p-2 w-1/2 border rounded-md"
                    >
                      <option value="day">Day</option>
                      <option value="week">Week</option>
                      <option value="month">Month</option>
                      <option value="year">Year</option>
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={newPlan.billingCycle.frequency}
                      onChange={(e) =>
                        setNewPlan({
                          ...newPlan,
                          billingCycle: {
                            ...newPlan.billingCycle,
                            frequency: parseInt(e.target.value),
                          },
                        })
                      }
                      className="mt-1 p-2 w-1/2 border rounded-md"
                      placeholder="Frequency"
                      required
                    />
                  </div>
                  <div className="mt-2">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={newPlan.billingCycle.isPerpetual}
                        onChange={(e) =>
                          setNewPlan({
                            ...newPlan,
                            billingCycle: {
                              ...newPlan.billingCycle,
                              isPerpetual: e.target.checked,
                            },
                          })
                        }
                      />
                      Perpetual (e.g., free plan)
                    </label>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Features</label>
                  <input
                  placeholder="Add feature"
                    value={currentFeature}
                    onChange={(e) => setCurrentFeature(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        const trimmedInp = currentFeature.trim()
                        if(trimmedInp){
                          setNewPlan((prev) => ({
                            ...prev,
                            features:[...prev.features,trimmedInp]
                          }))
                          setCurrentFeature('')
                        }
                      }
                    }}
                    className="mt-1 p-2 w-full border rounded-md"
                    required
                  />
                </div>
                <ul className="border-2 px-1 border-gray-200 rounded-2xl">
                    {newPlan.features.map((feat,ind) => (
                      <li key={ind} className="p-2 pl-4 bg-gray-200 my-1 rounded-xl">{feat}</li>
                    ))}
                </ul>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
  )
}

export default AddPlanModal
