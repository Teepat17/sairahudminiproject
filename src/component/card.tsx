interface CardProps { 
    name : string
    email : string
}

function card({ name, email }: CardProps) {
  return (
    <div className="p-4 bg-white border-gray-200 rounded-b-lg transition-all ">
        <img src="./WIN_20250408_09_01_21_Pro.jpg" alt="cat" className="rounded-t-lg w-full h-48 object-cover" />
        <h1>{email}</h1>
        <h1>{name}</h1>
    </div>
  )
}

export default card
