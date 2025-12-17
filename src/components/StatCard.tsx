type Props = {
  label: string
  value: number
  color?: string
}

const StatCard = ({ label, value, color }: Props) => {
  return (
    <div className={`rounded-xl p-4 shadow-sm text-center ${color || "bg-white"}`}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </div>
  )
}

export default StatCard
