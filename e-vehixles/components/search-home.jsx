<div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex items-center gap-3 overflow-x-auto">
              <div className="relative flex-1">
                <FaSearch className="absolute top-3.5 left-3 text-gray-400" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search vehicles or locations..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
                </div>
