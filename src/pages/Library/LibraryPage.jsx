import { useState, useMemo } from 'react';
import { useStudyData } from '../../context/StudyDataContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Search, BookOpen, FileText, FileSpreadsheet, GraduationCap, Download, Star, ChevronRight, Folder, BarChart3 } from 'lucide-react';

const materialTypes = [
  { value: 'all', label: 'All Materials', icon: BookOpen },
  { value: 'notes', label: 'Notes', icon: FileText },
  { value: 'papers', label: 'Question Papers', icon: FileSpreadsheet },
  { value: 'summary', label: 'Summaries', icon: BarChart3 },
  { value: 'guide', label: 'Guides', icon: BookOpen },
];

const typeColors = {
  notes: 'from-blue-500 to-blue-600',
  papers: 'from-purple-500 to-purple-600',
  summary: 'from-green-500 to-green-600',
  guide: 'from-orange-500 to-orange-600',
};

const typeIcons = {
  notes: FileText,
  papers: FileSpreadsheet,
  summary: BarChart3,
  guide: BookOpen,
};

const semesters = [1, 2, 3, 4, 5, 6];

export function LibraryPage() {
  const { libraryMaterials } = useStudyData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  const subjectsList = [...new Set(libraryMaterials.map(m => m.subject))];

  const filteredMaterials = useMemo(() => {
    return libraryMaterials.filter(material => {
      const matchesSearch = material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = selectedType === 'all' || material.type === selectedType;
      const matchesSemester = selectedSemester === 'all' || material.semester === Number(selectedSemester);
      const matchesSubject = selectedSubject === 'all' || material.subject === selectedSubject;
      return matchesSearch && matchesType && matchesSemester && matchesSubject;
    });
  }, [libraryMaterials, searchQuery, selectedType, selectedSemester, selectedSubject]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Library</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {libraryMaterials.length} study materials available
          </p>
        </div>
      </div>

      <Card className="sticky top-20 z-20" variant="glass">
        <CardContent className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search materials, topics, or tags..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {materialTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  selectedType === type.value
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <type.icon className="w-3 h-3" />
                {type.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-0 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Semesters</option>
                {semesters.map(s => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-0 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Subjects</option>
                {subjectsList.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredMaterials.map((material) => {
          const Icon = typeIcons[material.type] || FileText;
          return (
            <Card
              key={material.id}
              variant="glass"
              className="cursor-pointer hover:shadow-elevated hover:scale-[1.02] transition-all duration-300 group"
              onClick={() => setSelectedMaterial(material)}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${typeColors[material.type] || 'from-gray-500 to-gray-600'} text-white`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {material.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant="primary" size="xs">{material.type}</Badge>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Sem {material.semester}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{material.subject}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {material.pages} pages</span>
                      <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {material.downloads}</span>
                      <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500" /> {material.rating}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {material.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors mt-1 flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredMaterials.length === 0 && (
        <div className="text-center py-16">
          <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No materials found matching your filters.</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedType('all'); setSelectedSemester('all'); setSelectedSubject('all'); }}
            className="mt-3 text-sm text-primary-600 dark:text-primary-400 hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}

      <Modal
        isOpen={!!selectedMaterial}
        onClose={() => setSelectedMaterial(null)}
        title={selectedMaterial?.title}
        size="lg"
      >
        {selectedMaterial && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="primary">{selectedMaterial.type}</Badge>
              <Badge>Sem {selectedMaterial.semester}</Badge>
              <span className="text-sm text-gray-500">{selectedMaterial.subject}</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Comprehensive study material covering {selectedMaterial.tags.join(', ')} with detailed explanations and examples.
              Suitable for semester {selectedMaterial.semester} {selectedMaterial.subject} exams.
            </p>
            <div className="flex gap-3">
              <div className="flex-1 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-center">
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{selectedMaterial.pages}</p>
                <p className="text-xs text-gray-500">Pages</p>
              </div>
              <div className="flex-1 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-center">
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{selectedMaterial.downloads}</p>
                <p className="text-xs text-gray-500">Downloads</p>
              </div>
              <div className="flex-1 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-center">
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{selectedMaterial.rating}</p>
                <p className="text-xs text-gray-500">Rating</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 text-white font-medium hover:from-primary-700 hover:to-purple-700 transition-all">
                <Download className="w-4 h-4" /> Download
              </button>
              <button className="px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
                Preview
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
